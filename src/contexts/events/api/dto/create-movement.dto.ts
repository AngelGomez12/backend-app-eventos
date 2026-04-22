import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";

import { MovementType } from "../../domain/movement.entity";

export class CreateMovementDto {
  @ApiProperty({ example: "Catering Deposit" })
  @IsString()
  @IsNotEmpty()
  concept: string;

  @ApiProperty({ example: 1500.5 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: MovementType, example: MovementType.EXPENSE })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ example: "2026-04-15T20:00:00.000Z" })
  @IsDateString()
  date: string;
}
