import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, IsBoolean } from "class-validator";
import { TableType } from "../../domain/table.entity";

export class CreateTableDto {
  @ApiProperty({ example: "Mesa 1" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsOptional()
  @IsEnum(TableType)
  type?: TableType;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  scale?: number;

  @IsOptional()
  @IsBoolean()
  isStructural?: boolean;
}
