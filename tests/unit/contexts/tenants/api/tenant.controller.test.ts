import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { TenantController } from "@/contexts/tenants/api/tenant.controller";
import { TenantService } from "@/contexts/tenants/domain/tenant.service";

describe("TenantController", () => {
  let controller: TenantController;
  let service: MockProxy<TenantService>;

  beforeEach(() => {
    service = mock<TenantService>();
    controller = new TenantController(service);
  });

  describe("getPayments", () => {
    it("should return paginated payment history from service", async () => {
      const tenantId = "tenant-1";
      const filterDto = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [{ id: "payment-1" }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findPayments.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getPayments(tenantId, filterDto);

      expect(service.findPayments).toHaveBeenCalledWith(tenantId, filterDto);
      expect(result.data).toHaveLength(1);
    });
  });
});
