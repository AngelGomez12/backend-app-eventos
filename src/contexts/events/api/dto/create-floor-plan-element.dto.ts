import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { FloorPlanElementType } from "../../domain/floor-plan-element.entity";

export class CreateFloorPlanElementDto {
  @IsEnum(FloorPlanElementType)
  type: FloorPlanElementType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isStructural?: boolean;
}

export class UpdateFloorPlanElementDto {
  @IsOptional()
  @IsEnum(FloorPlanElementType)
  type?: FloorPlanElementType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isStructural?: boolean;
}
