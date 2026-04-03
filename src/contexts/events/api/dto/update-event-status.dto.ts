import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

import { EventStatus } from "../../domain/event.entity";

export class UpdateEventStatusDto {
  @ApiProperty({ enum: EventStatus, example: EventStatus.CONFIRMED })
  @IsEnum(EventStatus)
  status: EventStatus;
}
