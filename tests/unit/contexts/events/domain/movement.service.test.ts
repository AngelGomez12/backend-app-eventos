import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { EventService } from "@/contexts/events/domain/event.service";
import {
  EventMovement,
  MovementType,
} from "@/contexts/events/domain/movement.entity";
import { MovementService } from "@/contexts/events/domain/movement.service";

describe("MovementService", () => {
  let service: MovementService;
  let repository: DeepMockProxy<Repository<EventMovement>>;
  let eventService: DeepMockProxy<EventService>;

  beforeEach(async () => {
    repository = mockDeep<Repository<EventMovement>>();
    eventService = mockDeep<EventService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementService,
        {
          provide: getRepositoryToken(EventMovement),
          useValue: repository,
        },
        {
          provide: EventService,
          useValue: eventService,
        },
      ],
    }).compile();

    service = module.get<MovementService>(MovementService);
  });

  describe("create", () => {
    it("should create a movement if event belongs to tenant", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const dto = {
        concept: "Deposit",
        amount: 1000,
        type: MovementType.INCOME,
        date: new Date().toISOString(),
      };

      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.create.mockReturnValue({ ...dto, eventId } as any);
      repository.save.mockResolvedValue({
        id: "move-1",
        ...dto,
        eventId,
      } as any);

      const result = await service.create(tenantId, eventId, dto);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(repository.save).toHaveBeenCalled();
      expect(result.concept).toBe("Deposit");
    });
  });

  describe("findAll", () => {
    it("should return paginated movements for an event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const page = 1;
      const limit = 10;

      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.findAndCount.mockResolvedValue([
        [{ id: "move-1", concept: "A" }],
        1,
      ] as any);

      const result = await service.findAll(tenantId, eventId, page, limit);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { eventId },
        order: { date: "DESC", createdAt: "DESC" },
        skip: 0,
        take: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should return paginated movements for an event with different page and limit", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const page = 2;
      const limit = 5;

      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.findAndCount.mockResolvedValue([
        [{ id: "move-2", concept: "B" }],
        10,
      ] as any);

      const result = await service.findAll(tenantId, eventId, page, limit);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { eventId },
        order: { date: "DESC", createdAt: "DESC" },
        skip: 5,
        take: 5,
      });
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe("remove", () => {
    it("should throw NotFoundException if movement does not belong to event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const moveId = "move-1";

      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(tenantId, eventId, moveId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should remove movement if it belongs to event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const moveId = "move-1";
      const movement = { id: moveId, eventId } as any;

      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.findOne.mockResolvedValue(movement);
      repository.remove.mockResolvedValue(movement);

      await service.remove(tenantId, eventId, moveId);

      expect(repository.remove).toHaveBeenCalledWith(movement);
    });
  });
});
