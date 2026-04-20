import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateTenantDto } from "../api/dto/create-tenant.dto";
import { Tenant, TenantStatus, SubscriptionPlan } from "./tenant.entity";
import { TenantPayment } from "./payment.entity";

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantPayment)
    private readonly paymentRepository: Repository<TenantPayment>,
  ) {}

  async findAll(page: number, limit: number) {
    const [data, total] = await this.tenantRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: "ASC" },
    });

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

  async findPayments(tenantId: string) {
    return this.paymentRepository.find({
      where: { tenantId },
      order: { paymentDate: "DESC" },
    });
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
    const activeTenants = tenants.filter(t => t.status === TenantStatus.ACTIVE).length;
    const pendingTenants = tenants.filter(t => t.status === TenantStatus.PENDING_PAYMENT).length;
    const suspendedTenants = tenants.filter(t => t.status === TenantStatus.SUSPENDED).length;

    const mrr = tenants
      .filter(t => t.status === TenantStatus.ACTIVE)
      .reduce((sum, t) => {
        if (t.subscriptionPlan === SubscriptionPlan.PREMIUM) return sum + 5000;
        if (t.subscriptionPlan === SubscriptionPlan.ENTERPRISE) return sum + 10000;
        return sum;
      }, 0);

    return {
      totalTenants,
      activeTenants,
      pendingTenants,
      suspendedTenants,
      mrr
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
      .replace(/[\u0300-\u036F]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}