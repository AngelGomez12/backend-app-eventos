import { ApiProperty } from "@nestjs/swagger";

import { UserRole } from "../../domain/user.entity"; // Ensure the path goes up correctly

export class CreateUserDto {
  @ApiProperty({ example: "John Organizer" })
  fullName: string;

  @ApiProperty({ example: "john@event.com" })
  email: string;

  @ApiProperty({ example: "pass123" })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ORGANIZER })
  role: UserRole;
}
