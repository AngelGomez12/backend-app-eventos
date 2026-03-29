import { ApiProperty } from "@nestjs/swagger";

import { AttendanceStatus } from "../../domain/guest.entity";

export class CreateGuestDto {
  @ApiProperty({ example: "John Doe" })
  fullName: string;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PENDING,
    required: false,
  })
  attendanceStatus?: AttendanceStatus;
}
