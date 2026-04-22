// eslint-disable-next-line simple-import-sort/imports
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";

import { CreateTenantDto } from "../api/dto/create-tenant.dto";
import { TenantPayment } from "./payment.entity";
import { SubscriptionPlan, Tenant, TenantStatus } from "./tenant.entity";
import { FilterTenantDto } from "../api/dto/filter-tenant.dto";

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantPayment)
    private readonly paymentRepository: Repository<TenantPayment>,
  ) {}

  async findAll(filters: FilterTenantDto): Promise<PaginatedResponse<Tenant>> {
    const { page = 1, limit = 10 } = filters;

    const queryBuilder = this.tenantRepository
      .createQueryBuilder("tenant")
      .leftJoinAndSelect("tenant.payments", "payment")
      .orderBy("tenant.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.search) {
      queryBuilder.andWhere(
        "tenant.name ILIKE :search OR tenant.slug ILIKE :search",
        { search: `%${filters.search}%` },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return tenant;
  }

  async findPayments(
    tenantId: string,
    filters: FilterTenantDto,
  ): Promise<PaginatedResponse<TenantPayment>> {
    const [data, total] = await this.paymentRepository.findAndCount({
      where: { tenantId },
      order: { paymentDate: "DESC" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async recordPayment(
    tenantId: string,
    paymentData: {
      amount: number;
      currency: string;
      externalPaymentId: string;
      plan: SubscriptionPlan;
    },
  ) {
    // 1. Idempotency check
    const existing = await this.paymentRepository.findOne({
      where: { externalPaymentId: paymentData.externalPaymentId },
    });

    if (existing) {
      return;
    }

    // 2. Find and update tenant
    const tenant = await this.findOne(tenantId);

    tenant.status = TenantStatus.ACTIVE;
    tenant.isActive = true;
    tenant.lastPaymentId = paymentData.externalPaymentId;

    // Add 30 days to subscription
    const now = new Date();
    tenant.subscriptionEndDate = new Date(now.setDate(now.getDate() + 30));

    await this.tenantRepository.save(tenant);

    // 3. Create payment record
    const payment = this.paymentRepository.create({
      ...paymentData,
      tenantId,
    });

    return this.paymentRepository.save(payment);
  }

  async getStats() {
    const tenants = await this.tenantRepository.find();

    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(
      t => t.status === TenantStatus.ACTIVE,
    ).length;
    const pendingTenants = tenants.filter(
      t => t.status === TenantStatus.PENDING_PAYMENT,
    ).length;
    const suspendedTenants = tenants.filter(
      t => t.status === TenantStatus.SUSPENDED,
    ).length;

    const mrr = tenants
      .filter(t => t.status === TenantStatus.ACTIVE)
      .reduce((sum, t) => {
        if (t.subscriptionPlan === SubscriptionPlan.PREMIUM) return sum + 5000;
        if (t.subscriptionPlan === SubscriptionPlan.ENTERPRISE)
          return sum + 10_000;
        return sum;
      }, 0);

    return {
      totalTenants,
      activeTenants,
      pendingTenants,
      suspendedTenants,
      mrr,
    };
  }

  async updateStatus(id: string, status: TenantStatus) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    tenant.status = status;
    tenant.isActive = status === TenantStatus.ACTIVE;

    return this.tenantRepository.save(tenant);
  }

  async update(id: string, updateData: Partial<Tenant>) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    Object.assign(tenant, updateData);

    return this.tenantRepository.save(tenant);
  }

  async create(createTenantDto: CreateTenantDto) {
    const { name, slug } = createTenantDto;

    const finalSlug = slug ?? this.generateSlug(name);

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      slug: finalSlug,
    });

    return this.tenantRepository.save(tenant);
  }

  private generateSlug(text: string): string {
    return text
      .normalize("NFD")
      .replaceAll(/[\u0300-\u036F]/g, "")
      .toLowerCase()
      .trim()
      .replaceAll(/[^\w\s-]/g, "")
      .replaceAll(/[\s_-]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");
  }
}
