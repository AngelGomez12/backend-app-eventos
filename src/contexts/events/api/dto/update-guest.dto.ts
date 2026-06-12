import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";

import { AttendanceStatus, DietaryRestriction } from "../../domain/guest.entity";

export class UpdateGuestDto {
  @ApiProperty({ example: "John Doe", required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

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

  @ApiProperty({ example: "uuid-of-table", required: false, nullable: true })
  @ValidateIf((o) => o.tableId !== null)
  @IsUUID()
  @IsOptional()
  tableId?: string | null;
}
