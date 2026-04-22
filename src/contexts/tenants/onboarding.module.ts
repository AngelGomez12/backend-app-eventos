import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "@/contexts/users/domain/user.entity";

import { OnboardingController } from "./api/onboarding.controller";
import { OnboardingService } from "./domain/onboarding.service";
import { Tenant } from "./domain/tenant.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, User]), ConfigModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
