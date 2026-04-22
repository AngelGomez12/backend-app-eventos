import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { OnboardingService } from "../domain/onboarding.service";
import { OnboardingRegisterDto } from "./dto/onboarding-register.dto";

@ApiTags("Onboarding")
@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new salon and get payment link" })
  async register(@Body() dto: OnboardingRegisterDto) {
    return this.onboardingService.register(dto);
  }

  @Get("payment-link")
  @ApiOperation({
    summary: "Get payment link for an existing pending registration",
  })
  async getPaymentLink(@Query("email") email: string) {
    return this.onboardingService.getPaymentLinkByEmail(email);
  }

  @Get("check-payment")
  @ApiOperation({
    summary: "Check Mercado Pago payment status and activate tenant",
  })
  async checkPayment(@Query("payment_id") paymentId: string) {
    return this.onboardingService.checkPayment(paymentId);
  }
}
