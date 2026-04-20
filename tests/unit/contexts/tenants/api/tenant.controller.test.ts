import { TenantController } from "@/contexts/tenants/api/tenant.controller";
import { TenantService } from "@/contexts/tenants/domain/tenant.service";
import { describe, expect, it, beforeEach } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

describe("TenantController", () => {
  let controller: TenantController;
  let service: MockProxy<TenantService>;

  beforeEach(() => {
    service = mock<TenantService>();
    controller = new TenantController(service);
  });

  describe("getPayments", () => {
    it("should return payment history from service", async () => {
      const tenantId = "tenant-1";
      service.findPayments.mockResolvedValue([{ id: "pay-1", amount: 5000 }] as any);

      const result = await controller.getPayments(tenantId);

      expect(service.findPayments).toHaveBeenCalledWith(tenantId);
      expect(result).toHaveLength(1);
    });
  });
});
