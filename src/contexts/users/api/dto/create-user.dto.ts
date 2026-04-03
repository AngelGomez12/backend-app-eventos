import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";

import { UserRole } from "../../domain/user.entity"; // Ensure the path goes up correctly

export class CreateUserDto {
  @ApiProperty({ example: "John Organizer" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: "john@event.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "pass123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ORGANIZER })
  @IsEnum(UserRole)
  role: UserRole;
}
