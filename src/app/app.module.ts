import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HealthModule } from "@/app/health/health.module";

import { LoggerModule } from "@/shared/logger/logger.module";
import { AuthMiddleware } from "@/shared/middleware/auth.middleware";
import { CorrelationIdMiddleware } from "@/shared/middleware/correlation-id.middleware";
import { LoggerMiddleware } from "@/shared/middleware/logger.middleware";

import { AuditModule } from "@/contexts/audit/audit.module";
import { AuditInterceptor } from "@/contexts/audit/infrastructure/audit.interceptor";
import { AuthModule } from "@/contexts/auth/auth.module";
import { EventModule } from "@/contexts/events/event.module";
import { NotificationModule } from "@/contexts/notifications/notification.module";
import { RsvpModule } from "@/contexts/rsvp/rsvp.module";
import { WebhooksModule } from "@/contexts/shared/webhooks/webhooks.module";
import { OnboardingModule } from "@/contexts/tenants/onboarding.module";
import { TenantModule } from "@/contexts/tenants/tenant.module";
import { UserModule } from "@/contexts/users/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>(
          "DATABASE_URL",
          "postgresql://postgres:postgres@localhost:5432/eventos_db",
        ),
        autoLoadEntities: true,
        synchronize: true, // development only
      }),
    }),
    LoggerModule,
    HealthModule,
    AuthModule,
    TenantModule,
    UserModule,
    EventModule,
    RsvpModule,
    OnboardingModule,
    WebhooksModule,
    NotificationModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: "auth/login", method: RequestMethod.POST },
        { path: "auth/login", method: RequestMethod.OPTIONS },
        { path: "health", method: RequestMethod.GET },
        { path: "rsvp/(.*)", method: RequestMethod.ALL },
        { path: "onboarding/(.*)", method: RequestMethod.ALL },
        { path: "webhooks/(.*)", method: RequestMethod.ALL },
        { path: "notifications", method: RequestMethod.GET },
        { path: "docs/(.*)", method: RequestMethod.ALL },
        { path: "docs", method: RequestMethod.ALL },
      )
      .forRoutes("*");

    consumer.apply(LoggerMiddleware).forRoutes("*");
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
