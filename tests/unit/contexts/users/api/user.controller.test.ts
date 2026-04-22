import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { UserController } from "@/contexts/users/api/user.controller";
import { UserService } from "@/contexts/users/domain/user.service";

describe("UserController", () => {
  let controller: UserController;
  let service: MockProxy<UserService>;

  beforeEach(() => {
    service = mock<UserService>();
    controller = new UserController(service);
  });

  describe("getTenantUsers", () => {
    it("should return paginated users from service", async () => {
      const tenantId = "tenant-1";
      const paginationDto = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [{ id: "user-1", fullName: "John Doe" }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getTenantUsers(tenantId, paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(tenantId, 1, 10);
      expect(result.data).toHaveLength(1);
    });
  });
});
