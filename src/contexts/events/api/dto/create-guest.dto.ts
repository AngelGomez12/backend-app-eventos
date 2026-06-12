import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { AttendanceStatus, DietaryRestriction } from "../../domain/guest.entity";

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

  @ApiProperty({ example: "+54 9 11 1234-5678", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "john.doe@example.com", required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    enum: DietaryRestriction,
    example: DietaryRestriction.NONE,
    required: false,
  })
  @IsEnum(DietaryRestriction)
  @IsOptional()
  dietaryRestrictions?: DietaryRestriction;
}
