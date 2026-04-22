import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { TenantModule } from "@/contexts/tenants/tenant.module";

import { MercadoPagoWebhookController } from "./api/mercadopago.controller";

@Module({
  imports: [TenantModule, ConfigModule],
  controllers: [MercadoPagoWebhookController],
  providers: [],
})
export class WebhooksModule {}
