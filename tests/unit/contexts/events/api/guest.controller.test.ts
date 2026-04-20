import { GuestController } from "@/contexts/events/api/guest.controller";
import { GuestService } from "@/contexts/events/domain/guest.service";
import { AttendanceStatus } from "@/contexts/events/domain/guest.entity";
import { describe, expect, it, beforeEach } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

describe("GuestController", () => {
  let controller: GuestController;
  let service: MockProxy<GuestService>;

  beforeEach(() => {
    service = mock<GuestService>();
    controller = new GuestController(service);
  });

  describe("getGuests", () => {
    it("should return guests from service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      service.findAll.mockResolvedValue([{ id: "guest-1", fullName: "John Doe" }] as any);

      const result = await controller.getGuests(eventId, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(tenantId, eventId);
      expect(result).toHaveLength(1);
    });
  });

  describe("addGuest", () => {
    it("should create guest via service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const dto = { fullName: "John Doe", attendanceStatus: AttendanceStatus.PENDING };
      service.create.mockResolvedValue({ id: "guest-1", ...dto } as any);

      const result = await controller.addGuest(eventId, tenantId, dto);

      expect(service.create).toHaveBeenCalledWith(tenantId, eventId, dto);
      expect(result.fullName).toBe("John Doe");
    });
  });
});
