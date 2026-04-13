import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, Min } from "class-validator";

export class UpdateEventPriceDto {
  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  basePrice: number;
}