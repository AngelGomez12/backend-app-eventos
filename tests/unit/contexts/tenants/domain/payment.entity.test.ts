import { describe, expect, it } from "vitest";

import { TenantPayment } from "@/contexts/tenants/domain/payment.entity";
import { SubscriptionPlan } from "@/contexts/tenants/domain/tenant.entity";

describe("TenantPayment Entity", () => {
  it("should have all required properties", () => {
    const payment = new TenantPayment();
    payment.id = "pay-1";
    payment.tenantId = "tenant-1";
    payment.amount = 5000;
    payment.currency = "UYU";
    payment.externalPaymentId = "MP-123";
    payment.plan = SubscriptionPlan.PREMIUM;
    payment.paymentDate = new Date();

    expect(payment.id).toBe("pay-1");
    expect(payment.amount).toBe(5000);
    expect(payment.externalPaymentId).toBe("MP-123");
  });
});
