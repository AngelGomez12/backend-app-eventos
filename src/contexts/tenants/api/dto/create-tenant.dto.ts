import { ApiProperty } from "@nestjs/swagger";

export class CreateTenantDto {
  @ApiProperty({ example: "Los Pinos Eventos" })
  salonName: string;

  @ApiProperty({ example: "lospinos.app.com" })
  customDomain: string;

  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
