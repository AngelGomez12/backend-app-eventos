import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

import { AttendanceStatus } from "@/contexts/events/domain/guest.entity";

export class ConfirmRsvpDto {
  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.CONFIRMED })
  @IsEnum(AttendanceStatus)
  attendanceStatus: AttendanceStatus;
}
