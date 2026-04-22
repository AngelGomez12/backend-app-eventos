import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { NotificationController } from "@/contexts/notifications/api/notification.controller";
import { NotificationService } from "@/contexts/notifications/domain/notification.service";

describe("NotificationController", () => {
  let controller: NotificationController;
  let service: MockProxy<NotificationService>;

  beforeEach(() => {
    service = mock<NotificationService>();
    controller = new NotificationController(service);
  });

  describe("getAll", () => {
    it("should return paginated notifications from service", async () => {
      const filterDto = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [{ id: "notif-1" }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toHaveLength(1);
    });
  });
});
