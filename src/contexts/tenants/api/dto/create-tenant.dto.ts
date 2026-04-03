import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

import { SubscriptionPlan, TenantStatus } from "../../domain/tenant.entity";

export class CreateTenantDto {
  @ApiProperty({ example: "Los Pinos Eventos" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "los-pinos", required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: "lospinos.app.com", required: false })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty({ example: "https://storage.com/logo.png", required: false })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: "#4F46E5", required: false })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  // Ubicación básica
  @ApiProperty({ example: "Av. Italia 1234", required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: "Montevideo", required: false })
  @IsString()
  @IsOptional()
  city?: string;

  // Contacto
  @ApiProperty({ example: "contacto@lospinos.com", required: false })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({ example: "+598 99 123 456", required: false })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  // Configuración de Negocio
  @ApiProperty({ example: 200, required: false })
  @IsInt()
  @IsOptional()
  maxGuestCapacity?: number;

  @ApiProperty({ example: "UYU", required: false })
  @IsString()
  @IsOptional()
  defaultCurrency?: string;

  @ApiProperty({
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
    required: false,
  })
  @IsEnum(SubscriptionPlan)
  @IsOptional()
  subscriptionPlan?: SubscriptionPlan;

  @ApiProperty({
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
    required: false,
  })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
