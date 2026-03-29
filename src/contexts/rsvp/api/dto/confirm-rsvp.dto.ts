import { ApiProperty } from "@nestjs/swagger";

import { AttendanceStatus } from "@/contexts/events/domain/guest.entity";

export class ConfirmRsvpDto {
  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.CONFIRMED })
  attendanceStatus: AttendanceStatus;
}
