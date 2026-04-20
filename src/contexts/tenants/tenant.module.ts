import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TenantController } from "./api/tenant.controller";
import { Tenant } from "./domain/tenant.entity";
import { TenantPayment } from "./domain/payment.entity";
import { TenantService } from "./domain/tenant.service";

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantPayment])],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TypeOrmModule, TenantService],
})
export class TenantModule {}
