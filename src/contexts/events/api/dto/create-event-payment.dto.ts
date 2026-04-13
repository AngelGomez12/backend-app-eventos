import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { PaymentMethod } from "../../domain/event-payment.entity";

export class CreateEventPaymentDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.TRANSFER })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: "2026-10-15T20:00:00.000Z" })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}