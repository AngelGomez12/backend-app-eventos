import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

import { EventType } from "../../domain/event.entity";

export class CreateEventDto {
  @ApiProperty({ example: "Maria's Wedding" })
  @IsString()
  @IsNotEmpty()
  honoreeName: string;

  @ApiProperty({ enum: EventType, example: EventType.WEDDING })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: "2026-10-15T20:00:00.000Z" })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: 150 })
  @IsInt()
  @IsPositive()
  approximateGuestCount: number;

  @ApiProperty({ example: 10, required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  maxTableCount?: number;

  @ApiProperty({ description: "User ID of the organizer" })
  @IsString()
  @IsNotEmpty()
  organizerId: string;
}
