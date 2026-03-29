import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "admin@lospinos.com" })
  email: string;

  @ApiProperty({ example: "password123" })
  password: string;

  @ApiProperty({ required: false, example: "lospinos.app.com" })
  customDomain?: string;
}
