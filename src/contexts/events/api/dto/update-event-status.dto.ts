import { ApiProperty } from "@nestjs/swagger";

import { EventStatus } from "../../domain/event.entity";

export class UpdateEventStatusDto {
  @ApiProperty({ enum: EventStatus, example: EventStatus.CONFIRMED })
  status: EventStatus;
}
