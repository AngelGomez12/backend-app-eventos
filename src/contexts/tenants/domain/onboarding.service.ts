import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { DataSource, Repository } from "typeorm";

import { User, UserRole } from "@/contexts/users/domain/user.entity";

import { OnboardingRegisterDto } from "../api/dto/onboarding-register.dto";
import { SubscriptionPlan, Tenant, TenantStatus } from "./tenant.entity";

@Injectable()
export class OnboardingService {
  private readonly mpClient: MercadoPagoConfig;

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    const accessToken = this.configService.get<string>("MP_ACCESS_TOKEN", "");
    this.mpClient = new MercadoPagoConfig({ accessToken });
  }

  async register(dto: OnboardingRegisterDto) {
    return this.dataSource.transaction(async manager => {
      try {
        const tenant = manager.create(Tenant, {
          name: dto.salonName,
          subscriptionPlan: dto.plan,
          status: TenantStatus.PENDING_PAYMENT,
          isActive: false,
        });
        const savedTenant = await manager.save(tenant);

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = manager.create(User, {
          fullName: "Administrador",
          email: dto.email,
          passwordHash,
          role: UserRole.SALON_ADMIN,
          tenantId: savedTenant.id,
        });
        await manager.save(user);

        const res = await this.generatePreference(
          savedTenant.id,
          dto.email,
          dto.plan,
        );

        savedTenant.mercadoPagoId = res.preferenceId ?? "";
        await manager.save(savedTenant);

        return {
          tenantId: savedTenant.id,
          preferenceId: res.preferenceId,
          initPoint: res.initPoint,
          sandboxInitPoint: res.sandbox_init_point,
        };
      } catch (error) {
        console.error("Error in onboarding transaction:", error);
        throw new InternalServerErrorException(
          "Could not complete onboarding registration",
        );
      }
    });
  }

  async getPaymentLinkByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["tenant"],
    });

    if (!user?.tenant) {
      throw new NotFoundException("User or tenant not found");
    }

    const payments = await this.searchApprovedPayments(user.tenant.id);
    if (payments.length > 0) {
      const bestPayment = payments[0];
      await this.activateTenant(user.tenant, String(bestPayment.id ?? ""));
      return {
        activated: true,
        message:
          "Account was pending but an approved payment was found and activated.",
      };
    }

    if (user.tenant.status !== TenantStatus.PENDING_PAYMENT) {
      throw new InternalServerErrorException(
        "Tenant is not in pending payment status",
      );
    }

    const res = await this.generatePreference(
      user.tenant.id,
      email,
      user.tenant.subscriptionPlan,
    );
    return { ...res, activated: false };
  }

  async checkPayment(paymentId: string) {
    try {
      const payment = new Payment(this.mpClient);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === "approved") {
        const tenantId = paymentData.external_reference;

        if (tenantId) {
          const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId },
          });

          if (tenant && tenant.status === TenantStatus.PENDING_PAYMENT) {
            await this.activateTenant(tenant, paymentId);
            return {
              status: "approved",
              message: "Tenant activated successfully",
            };
          }
        }
      }
      return { status: paymentData.status, message: "Payment processed" };
    } catch (error) {
      console.error("Error checking Mercado Pago payment:", error);
      throw new InternalServerErrorException("Error validating payment");
    }
  }

  private async activateTenant(tenant: Tenant, paymentId: string) {
    tenant.status = TenantStatus.ACTIVE;
    tenant.isActive = true;
    tenant.lastPaymentId = paymentId;

    const now = new Date();
    tenant.subscriptionEndDate = new Date(now.setDate(now.getDate() + 30));

    await this.tenantRepository.save(tenant);
  }

  private async searchApprovedPayments(tenantId: string) {
    try {
      const payment = new Payment(this.mpClient);
      const result = await payment.search({
        options: {
          external_reference: tenantId,
          status: "approved",
        },
      });
      return result.results || [];
    } catch (error) {
      console.error("Error searching payments:", error);
      return [];
    }
  }

  private async generatePreference(
    tenantId: string,
    email: string,
    plan: SubscriptionPlan,
  ) {
    const preference = new Preference(this.mpClient);
    const itemPrice = plan === SubscriptionPlan.PREMIUM ? 5000 : 2500;

    const frontendUrl = this.configService.get<string>(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    const webhookUrl = this.configService.get<string>("WEBHOOK_URL", "");

    const preferenceBody: any = {
      items: [
        {
          id: `subscription-${plan}`,
          title: `Plan ${plan} - Eventos SaaS`,
          quantity: 1,
          unit_price: itemPrice,
          currency_id: "UYU",
        },
      ],
      payer: { email },
      external_reference: tenantId,
      back_urls: {
        success: `${frontendUrl}/onboarding/success`,
        failure: `${frontendUrl}/onboarding/failure`,
        pending: `${frontendUrl}/onboarding/pending`,
      },
    };

    if (
      webhookUrl &&
      webhookUrl.startsWith("https") &&
      !webhookUrl.includes("localhost")
    ) {
      preferenceBody.notification_url = `${webhookUrl}/webhooks/mercadopago`;
    }

    const preferenceResponse = await preference.create({
      body: preferenceBody,
    });

    return {
      preferenceId: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandbox_init_point: preferenceResponse.sandbox_init_point,
    };
  }
}
