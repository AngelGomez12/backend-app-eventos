import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { CreateGuestDto } from "@/contexts/events/api/dto/create-guest.dto";
import { UpdateGuestDto } from "@/contexts/events/api/dto/update-guest.dto";
import { EventService } from "@/contexts/events/domain/event.service";
import { AttendanceStatus, Guest } from "@/contexts/events/domain/guest.entity";
import { GuestService } from "@/contexts/events/domain/guest.service";

describe("GuestService", () => {
  let service: GuestService;
  let guestRepository: DeepMockProxy<Repository<Guest>>;
  let eventService: DeepMockProxy<EventService>;

  beforeEach(async () => {
    guestRepository = mockDeep<Repository<Guest>>();
    eventService = mockDeep<EventService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestService,
        {
          provide: getRepositoryToken(Guest),
          useValue: guestRepository,
        },
        {
          provide: EventService,
          useValue: eventService,
        },
      ],
    }).compile();

    service = module.get<GuestService>(GuestService);
  });

  describe("create", () => {
    it("should create a guest", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const dto: CreateGuestDto = {
        fullName: "John Doe",
        attendanceStatus: AttendanceStatus.PENDING,
      };

      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.create.mockReturnValue({ ...dto, eventId } as any);
      guestRepository.save.mockResolvedValue({
        id: "guest-1",
        ...dto,
        eventId,
      } as any);

      const result = await service.create(tenantId, eventId, dto);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(guestRepository.save).toHaveBeenCalled();
      expect(result.fullName).toBe("John Doe");
    });
  });

  describe("findAll", () => {
    it("should return paginated guests for an event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const page = 1;
      const limit = 10;

      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      guestRepository.findAndCount.mockResolvedValue([
        [{ id: "guest-1", fullName: "John Doe" }],
        1,
      ] as any);

      const result = await service.findAll(tenantId, eventId, page, limit);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(guestRepository.findAndCount).toHaveBeenCalledWith({
        where: { eventId },
        order: { fullName: "ASC" },
        skip: 0,
        take: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should return paginated guests for an event with different page and limit", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const page = 3;
      const limit = 20;

      eventService.findOne.mockResolvedValue({ id: eventId, tenantId } as any);
      guestRepository.findAndCount.mockResolvedValue([[], 50] as any);

      const result = await service.findAll(tenantId, eventId, page, limit);

      expect(guestRepository.findAndCount).toHaveBeenCalledWith({
        where: { eventId },
        order: { fullName: "ASC" },
        skip: 40,
        take: 20,
      });
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe("update", () => {
    it("should update a guest", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const guestId = "guest-1";
      const dto: UpdateGuestDto = { fullName: "Jane Doe" };

      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.findOne.mockResolvedValue({
        id: guestId,
        eventId,
      } as any);
      guestRepository.save.mockResolvedValue({
        id: guestId,
        fullName: "Jane Doe",
      } as any);

      const result = await service.update(tenantId, eventId, guestId, dto);

      expect(result.fullName).toBe("Jane Doe");
      expect(guestRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if guest does not belong to event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const guestId = "guest-1";

      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(tenantId, eventId, guestId, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a guest", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const guestId = "guest-1";
      const guest = { id: guestId, eventId } as any;

      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.findOne.mockResolvedValue(guest);
      guestRepository.remove.mockResolvedValue(guest);

      await service.remove(tenantId, eventId, guestId);

      expect(guestRepository.remove).toHaveBeenCalledWith(guest);
    });
  });
});
