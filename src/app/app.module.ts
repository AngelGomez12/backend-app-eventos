import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HealthModule } from "@/app/health/health.module";

import { LoggerModule } from "@/shared/logger/logger.module";

import { AuthModule } from "@/contexts/auth/auth.module";
import { EventModule } from "@/contexts/events/event.module";
import { RsvpModule } from "@/contexts/rsvp/rsvp.module";
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
  ],
})
export class AppModule {}
