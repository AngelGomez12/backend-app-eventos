import { Body, Controller, Post, Query } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Payment } from "mercadopago";

import { TenantService } from "@/contexts/tenants/domain/tenant.service";

@Controller("webhooks/mercadopago")
export class MercadoPagoWebhookController {
  private readonly mpClient: MercadoPagoConfig;

  constructor(
    private readonly tenantService: TenantService,
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
    const resourceId = id || body?.data?.id;
    const resourceType = topic || body?.type;

    if (resourceType === "payment" && resourceId) {
      try {
        const payment = new Payment(this.mpClient);
        const paymentData = await payment.get({ id: resourceId });

        if (paymentData.status === "approved") {
          const tenantId = paymentData.external_reference;

          if (tenantId) {
            await this.tenantService.recordPayment(tenantId, {
              amount: paymentData.transaction_amount ?? 0,
              currency: paymentData.currency_id ?? "UYU",
              externalPaymentId: resourceId,
              plan: (paymentData as any).metadata?.plan || "PREMIUM", // Fallback or from metadata
            });
            console.log(
              `Tenant ${tenantId} activated via Mercado Pago payment ${resourceId}`,
            );
          }
        }
      } catch (error) {
        console.error("Error processing Mercado Pago webhook:", error);
      }
    }

    return { received: true };
  }
}
