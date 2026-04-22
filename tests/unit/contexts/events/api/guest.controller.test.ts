import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { GuestController } from "@/contexts/events/api/guest.controller";
import { AttendanceStatus } from "@/contexts/events/domain/guest.entity";
import { GuestService } from "@/contexts/events/domain/guest.service";

describe("GuestController", () => {
  let controller: GuestController;
  let service: MockProxy<GuestService>;

  beforeEach(() => {
    service = mock<GuestService>();
    controller = new GuestController(service);
  });

  describe("getGuests", () => {
    it("should return paginated guests from service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const paginationDto = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [{ id: "guest-1", fullName: "John Doe" }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getGuests(
        eventId,
        tenantId,
        paginationDto,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        tenantId,
        eventId,
        1,
        10,
        undefined,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("addGuest", () => {
    it("should create guest via service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const dto = {
        fullName: "John Doe",
        attendanceStatus: AttendanceStatus.PENDING,
      };
      service.create.mockResolvedValue({ id: "guest-1", ...dto } as any);

      const result = await controller.addGuest(eventId, tenantId, dto);

      expect(service.create).toHaveBeenCalledWith(tenantId, eventId, dto);
      expect(result.fullName).toBe("John Doe");
    });
  });
});
