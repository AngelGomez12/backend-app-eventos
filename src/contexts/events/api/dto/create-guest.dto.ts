import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { AttendanceStatus } from "../../domain/guest.entity";

export class CreateGuestDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PENDING,
    required: false,
  })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  attendanceStatus?: AttendanceStatus;
}
