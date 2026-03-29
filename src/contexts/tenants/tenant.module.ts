import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TenantController } from "./api/tenant.controller";
import { Tenant } from "./domain/tenant.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantController],
  exports: [TypeOrmModule],
})
export class TenantModule {}
