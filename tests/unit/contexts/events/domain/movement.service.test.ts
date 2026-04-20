import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

import { MovementService } from "@/contexts/events/domain/movement.service";
import { EventMovement, MovementType } from "@/contexts/events/domain/movement.entity";
import { EventService } from "@/contexts/events/domain/event.service";

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
      const dto = { concept: "Deposit", amount: 1000, type: MovementType.INCOME, date: new Date().toISOString() };
      
      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.create.mockReturnValue({ ...dto, eventId } as any);
      repository.save.mockResolvedValue({ id: "move-1", ...dto, eventId } as any);

      const result = await service.create(tenantId, eventId, dto);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(repository.save).toHaveBeenCalled();
      expect(result.concept).toBe("Deposit");
    });
  });

  describe("findAll", () => {
    it("should return all movements for an event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      
      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.find.mockResolvedValue([{ id: "move-1", concept: "A" }] as any);

      const result = await service.findAll(tenantId, eventId);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(result).toHaveLength(1);
    });
  });

  describe("remove", () => {
    it("should throw NotFoundException if movement does not belong to event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const moveId = "move-1";
      
      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      repository.findOne.mockResolvedValue(null); // Not found in this event

      await expect(service.remove(tenantId, eventId, moveId)).rejects.toThrow(NotFoundException);
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
