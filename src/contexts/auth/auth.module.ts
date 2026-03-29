import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "@/contexts/users/domain/user.entity";

import { AuthController } from "./api/auth.controller";
import { AuthService } from "./domain/auth.service";
import { JwtStrategy } from "./domain/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(
          "JWT_SECRET",
          "super-secret-key-change-me",
        ),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRATION", "1d"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Exported in case other modules need it
})
export class AuthModule {}
