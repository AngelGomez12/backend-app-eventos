import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class FilterTenantDto {
  @ApiProperty({ required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiProperty({ required: false, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit = 10;

  @ApiProperty({ required: false, description: "Filter by tenant name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    description: "General search across tenant fields",
  })
  @IsString()
  @IsOptional()
  search?: string;
}
