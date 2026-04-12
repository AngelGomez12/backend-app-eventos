import { Body, Controller, Post, Query } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Repository } from "typeorm";

import { Tenant, TenantStatus } from "@/contexts/tenants/domain/tenant.entity";

@Controller("webhooks/mercadopago")
export class MercadoPagoWebhookController {
  private readonly mpClient: MercadoPagoConfig;

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly configService: ConfigService,
  ) {
    const accessToken = this.configService.get<string>("MP_ACCESS_TOKEN", "");
    this.mpClient = new MercadoPagoConfig({ accessToken });
  }

  @Post()
  async handleNotification(
    @Query("topic") topic: string,
    @Query("id") id: string,
    @Body() body: any,
  ) {
    // Mercado Pago manda notificaciones de varios tipos. Nos interesa 'payment'.
    // El ID puede venir en el query param 'id' o en el body como resource/id.
    const resourceId = id || body?.data?.id;
    const resourceType = topic || body?.type;

    if (resourceType === "payment" && resourceId) {
      try {
        const payment = new Payment(this.mpClient);
        const paymentData = await payment.get({ id: resourceId });

        if (paymentData.status === "approved") {
          const tenantId = paymentData.external_reference;

          if (tenantId) {
            const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });

            if (tenant && tenant.status === TenantStatus.PENDING_PAYMENT) {
              tenant.status = TenantStatus.ACTIVE;
              tenant.isActive = true;
              tenant.lastPaymentId = resourceId;

              // Sumamos 30 días a la suscripción
              const now = new Date();
              tenant.subscriptionEndDate = new Date(now.setDate(now.getDate() + 30));

              await this.tenantRepository.save(tenant);
              console.log(`Tenant ${tenantId} activated via Mercado Pago payment ${resourceId}`);
            }
          }
        }
      } catch (error) {
        console.error("Error processing Mercado Pago webhook:", error);
      }
    }

    // Siempre devolvemos 200 a Mercado Pago para que deje de reintentar
    return { received: true };
  }
}
