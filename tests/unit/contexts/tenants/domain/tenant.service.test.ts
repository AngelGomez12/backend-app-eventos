import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { CreateTenantDto } from "@/contexts/tenants/api/dto/create-tenant.dto";
import { TenantPayment } from "@/contexts/tenants/domain/payment.entity";
import {
  SubscriptionPlan,
  Tenant,
  TenantStatus,
} from "@/contexts/tenants/domain/tenant.entity";
import { TenantService } from "@/contexts/tenants/domain/tenant.service";

describe("TenantService", () => {
  let service: TenantService;
  let repository: DeepMockProxy<Repository<Tenant>>;
  let paymentRepository: DeepMockProxy<Repository<TenantPayment>>;

  beforeEach(async () => {
    repository = mockDeep<Repository<Tenant>>();
    paymentRepository = mockDeep<Repository<TenantPayment>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: repository,
        },
        {
          provide: getRepositoryToken(TenantPayment),
          useValue: paymentRepository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  describe("recordPayment", () => {
    it("should update tenant and create payment record", async () => {
      const tenantId = "tenant-1";
      const paymentData = {
        amount: 5000,
        currency: "UYU",
        externalPaymentId: "MP-123",
        plan: SubscriptionPlan.PREMIUM,
      };

      const tenant = {
        id: tenantId,
        status: TenantStatus.PENDING_PAYMENT,
      } as Tenant;
      repository.findOne.mockResolvedValue(tenant);
      paymentRepository.findOne.mockResolvedValue(null); // Not a duplicate

      (paymentRepository.create as any).mockImplementation(
        (d: any) => d as TenantPayment,
      );
      (paymentRepository.save as any).mockImplementation((d: any) =>
        Promise.resolve({ ...d, id: "pay-1" } as TenantPayment),
      );

      const result = await service.recordPayment(tenantId, paymentData);

      expect(tenant.status).toBe(TenantStatus.ACTIVE);
      expect(tenant.lastPaymentId).toBe("MP-123");
      expect(repository.save).toHaveBeenCalledWith(tenant);
      expect(paymentRepository.save).toHaveBeenCalled();
      expect(result?.externalPaymentId).toBe("MP-123");
    });

    it("should skip if payment already exists (idempotency)", async () => {
      const tenantId = "tenant-1";
      const paymentData = { externalPaymentId: "MP-123" } as any;

      paymentRepository.findOne.mockResolvedValue({
        id: "existing",
      } as TenantPayment);

      const result = await service.recordPayment(tenantId, paymentData);

      expect(result).toBeUndefined();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findPayments", () => {
    it("should return paginated history for a tenant", async () => {
      const tenantId = "tenant-1";
      const page = 1;
      const limit = 10;
      paymentRepository.findAndCount.mockResolvedValue([
        [{ id: "pay-1" } as TenantPayment],
        1,
      ]);

      const result = await service.findPayments(tenantId, { page, limit });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(paymentRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId },
        order: { paymentDate: "DESC" },
        skip: 0,
        take: 10,
      });
    });
  });

  describe("create", () => {
    it("should generate a slug if not provided", async () => {
      const dto: CreateTenantDto = {
        name: "Salón Los Pinos !!!",
      };

      (repository.create as any).mockImplementation((d: any) => d as Tenant);
      (repository.save as any).mockImplementation((d: any) =>
        Promise.resolve({ ...d, id: "uuid" } as Tenant),
      );

      const result = await service.create(dto);

      expect(result.slug).toBe("salon-los-pinos");
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: "salon-los-pinos",
        }),
      );
    });

    it("should use provided slug if it exists", async () => {
      const dto: CreateTenantDto = {
        name: "Salón Los Pinos",
        slug: "custom-slug-123",
      };

      (repository.create as any).mockImplementation((d: any) => d as Tenant);
      (repository.save as any).mockImplementation((d: any) =>
        Promise.resolve({ ...d, id: "uuid" } as Tenant),
      );

      const result = await service.create(dto);

      expect(result.slug).toBe("custom-slug-123");
    });

    it("should handle special characters in slug generation", async () => {
      const dto: CreateTenantDto = {
        name: "  Eventos @ Montevideo & Punta del Este  ",
      };

      (repository.create as any).mockImplementation((d: any) => d as Tenant);
      (repository.save as any).mockImplementation((d: any) =>
        Promise.resolve({ ...d, id: "uuid" } as Tenant),
      );

      const result = await service.create(dto);

      expect(result.slug).toBe("eventos-montevideo-punta-del-este");
    });
  });

  describe("findAll", () => {
    it("should return paginated results", async () => {
      const tenants = [{ name: "A" }, { name: "B" }] as Tenant[];
      const queryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([tenants, 2]),
      };
      (repository.createQueryBuilder as any).mockReturnValue(queryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });
});
