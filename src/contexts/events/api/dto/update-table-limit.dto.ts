import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, Min } from "class-validator";

export class UpdateTableLimitDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  maxTableCount: number;
}
