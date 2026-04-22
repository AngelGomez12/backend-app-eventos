import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { EventController } from "@/contexts/events/api/event.controller";
import { EventService } from "@/contexts/events/domain/event.service";
import { UserRole } from "@/contexts/users/domain/user.entity";

describe("EventController", () => {
  let controller: EventController;
  let service: MockProxy<EventService>;

  beforeEach(() => {
    service = mock<EventService>();
    controller = new EventController(service);
  });

  describe("getEvents", () => {
    it("should return paginated events from service", async () => {
      const tenantId = "tenant-1";
      const user = { id: "user-1", role: UserRole.SALON_ADMIN };
      const paginationDto = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [{ id: "event-1" }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getEvents(tenantId, user, paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(tenantId, user, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
