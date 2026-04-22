import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { EventService } from "@/contexts/events/domain/event.service";
import { Table } from "@/contexts/events/domain/table.entity";
import { TableService } from "@/contexts/events/domain/table.service";

describe("TableService (Limit Validation)", () => {
  let service: TableService;
  let repository: DeepMockProxy<Repository<Table>>;
  let eventService: DeepMockProxy<EventService>;

  beforeEach(async () => {
    repository = mockDeep<Repository<Table>>();
    eventService = mockDeep<EventService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: getRepositoryToken(Table),
          useValue: repository,
        },
        {
          provide: EventService,
          useValue: eventService,
        },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
  });

  describe("create", () => {
    it("should allow creation if under limit", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const dto = { name: "Mesa 1" };

      eventService.findOne.mockResolvedValue({
        id: eventId,
        maxTableCount: 10,
      } as any);
      repository.count.mockResolvedValue(5);
      repository.create.mockReturnValue({ ...dto, eventId } as any);
      repository.save.mockResolvedValue({
        id: "table-1",
        ...dto,
        eventId,
      } as any);

      const result = await service.create(tenantId, eventId, dto);

      expect(result.id).toBe("table-1");
    });

    it("should allow creation if limit is 0 (unlimited)", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const dto = { name: "Mesa 1" };

      eventService.findOne.mockResolvedValue({
        id: eventId,
        maxTableCount: 0,
      } as any);
      repository.count.mockResolvedValue(100);
      repository.create.mockReturnValue({ ...dto, eventId } as any);
      repository.save.mockResolvedValue({
        id: "table-1",
        ...dto,
        eventId,
      } as any);

      const result = await service.create(tenantId, eventId, dto);

      expect(result.id).toBe("table-1");
    });

    it("should throw BadRequestException if limit reached", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const dto = { name: "Mesa 11" };

      eventService.findOne.mockResolvedValue({
        id: eventId,
        maxTableCount: 10,
      } as any);
      repository.count.mockResolvedValue(10);

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
