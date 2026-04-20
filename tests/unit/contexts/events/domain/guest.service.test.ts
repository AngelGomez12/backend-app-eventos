import { GuestService } from "@/contexts/events/domain/guest.service";
import { EventService } from "@/contexts/events/domain/event.service";
import { Guest, AttendanceStatus } from "@/contexts/events/domain/guest.entity";
import { CreateGuestDto } from "@/contexts/events/api/dto/create-guest.dto";
import { UpdateGuestDto } from "@/contexts/events/api/dto/update-guest.dto";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";

describe("GuestService", () => {
  let service: GuestService;
  let guestRepository: MockProxy<Repository<Guest>>;
  let eventService: MockProxy<EventService>;

  beforeEach(() => {
    guestRepository = mock<Repository<Guest>>();
    eventService = mock<EventService>();
    service = new GuestService(guestRepository, eventService);
  });

  describe("create", () => {
    it("should create a guest if event belongs to tenant", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const dto: CreateGuestDto = { fullName: "John Doe", attendanceStatus: AttendanceStatus.PENDING };
      
      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.create.mockReturnValue({ ...dto, eventId } as any);
      guestRepository.save.mockResolvedValue({ id: "guest-1", ...dto, eventId } as any);

      const result = await service.create(tenantId, eventId, dto);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(guestRepository.save).toHaveBeenCalled();
      expect(result.fullName).toBe("John Doe");
    });
  });

  describe("findAll", () => {
    it("should return all guests for an event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      
      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.find.mockResolvedValue([{ id: "guest-1", fullName: "John Doe" }] as any);

      const result = await service.findAll(tenantId, eventId);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe("John Doe");
    });
  });

  describe("update", () => {
    it("should update a guest", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const guestId = "guest-1";
      const dto: UpdateGuestDto = { fullName: "Jane Doe" };
      
      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.findOne.mockResolvedValue({ id: guestId, eventId } as any);
      guestRepository.save.mockResolvedValue({ id: guestId, fullName: "Jane Doe" } as any);

      const result = await service.update(tenantId, eventId, guestId, dto);

      expect(result.fullName).toBe("Jane Doe");
      expect(guestRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if guest does not belong to event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const guestId = "guest-1";
      
      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      // Mock findOne to return null when eventId doesn't match (due to where clause in service)
      guestRepository.findOne.mockResolvedValue(null);

      await expect(service.update(tenantId, eventId, guestId, {})).rejects.toThrow(NotFoundException);
    });
  });
});
