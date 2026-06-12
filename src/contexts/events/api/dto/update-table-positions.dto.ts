import { IsArray, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateTablePositionItemDto {
  @IsUUID()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  rotation: number;

  @IsOptional()
  isStructural?: boolean;
}

export class UpdateTablePositionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTablePositionItemDto)
  positions: UpdateTablePositionItemDto[];
}
