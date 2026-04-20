import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTableDto {
  @ApiProperty({ example: "Mesa 1" })
  @IsString()
  @IsNotEmpty()
  name: string;
}
