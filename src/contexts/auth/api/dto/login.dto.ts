import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@lospinos.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, example: "lospinos.app.com" })
  @IsString()
  @IsOptional()
  customDomain?: string;
}
