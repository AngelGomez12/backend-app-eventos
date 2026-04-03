import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { Repository } from "typeorm";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

import { TenantService } from "@/contexts/tenants/domain/tenant.service";
import { Tenant, SubscriptionPlan, TenantStatus } from "@/contexts/tenants/domain/tenant.entity";
import { CreateTenantDto } from "@/contexts/tenants/api/dto/create-tenant.dto";

describe("TenantService", () => {
  let service: TenantService;
  let repository: DeepMockProxy<Repository<Tenant>>;

  beforeEach(async () => {
    repository = mockDeep<Repository<Tenant>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  describe("create", () => {
    it("should generate a slug if not provided", async () => {
      const dto: CreateTenantDto = {
        name: "Salón Los Pinos !!!",
        // slug no viene
      };

      repository.create.mockImplementation((d: any) => d as Tenant);
      repository.save.mockImplementation(async (d: any) => ({ id: "uuid", ...d } as Tenant));

      const result = await service.create(dto);

      expect(result.slug).toBe("salon-los-pinos");
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        slug: "salon-los-pinos"
      }));
    });

    it("should use provided slug if it exists", async () => {
      const dto: CreateTenantDto = {
        name: "Salón Los Pinos",
        slug: "custom-slug-123"
      };

      repository.create.mockImplementation((d: any) => d as Tenant);
      repository.save.mockImplementation(async (d: any) => ({ id: "uuid", ...d } as Tenant));

      const result = await service.create(dto);

      expect(result.slug).toBe("custom-slug-123");
    });

    it("should handle special characters in slug generation", async () => {
      const dto: CreateTenantDto = {
        name: "  Eventos @ Montevideo & Punta del Este  ",
      };

      repository.create.mockImplementation((d: any) => d as Tenant);
      repository.save.mockImplementation(async (d: any) => ({ id: "uuid", ...d } as Tenant));

      const result = await service.create(dto);

      expect(result.slug).toBe("eventos-montevideo-punta-del-este");
    });
  });

  describe("findAll", () => {
    it("should return paginated results", async () => {
      const tenants = [{ name: "A" }, { name: "B" }] as Tenant[];
      repository.findAndCount.mockResolvedValue([tenants, 2]);

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
      expect(repository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        order: { name: "ASC" }
      }));
    });
  });
});
