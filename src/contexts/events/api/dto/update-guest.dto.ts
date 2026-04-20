import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { AttendanceStatus } from "../../domain/guest.entity";

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

  @ApiProperty({ example: "Vegan", required: false })
  @IsString()
  @IsOptional()
  dietaryRestrictions?: string;

  @ApiProperty({ example: "uuid-of-table", required: false })
  @IsUUID()
  @IsOptional()
  tableId?: string;
}
