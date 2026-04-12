import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { SubscriptionPlan } from "../../domain/tenant.entity";

export class OnboardingRegisterDto {
  @ApiProperty({ example: "Salón Los Pinos", description: "Nombre del salón o negocio" })
  @IsString()
  @IsNotEmpty()
  salonName: string;

  @ApiProperty({ example: "dueño@salonlospinos.com", description: "Email del administrador" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Password123!", description: "Contraseña para el acceso administrador" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: SubscriptionPlan.PREMIUM, 
    enum: SubscriptionPlan, 
    description: "Plan de suscripción elegido" 
  })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}
