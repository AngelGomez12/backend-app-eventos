import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Tenant } from "@/contexts/tenants/domain/tenant.entity";

import { MercadoPagoWebhookController } from "./api/mercadopago.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    ConfigModule,
  ],
  controllers: [MercadoPagoWebhookController],
  providers: [],
})
export class WebhooksModule {}
