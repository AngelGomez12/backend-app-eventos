import { ApiProperty } from "@nestjs/swagger";

import { EventType } from "../../domain/event.entity";

export class CreateEventDto {
  @ApiProperty({ example: "Maria's Wedding" })
  honoreeName: string;

  @ApiProperty({ enum: EventType, example: EventType.WEDDING })
  type: EventType;

  @ApiProperty({ example: "2026-10-15T20:00:00.000Z" })
  date: Date;

  @ApiProperty({ example: 150 })
  approximateGuestCount: number;

  @ApiProperty({ description: "User ID of the organizer" })
  organizerId: string;
}
