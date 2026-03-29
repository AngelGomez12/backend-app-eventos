import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { CreateTenantDto } from "./dto/create-tenant.dto";

@ApiTags("Tenants")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("tenants")
export class TenantController {
  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "List all tenants (Super Admin only)" })
  async getAllTenants() {
    return {
      message: "List of all tenants in the platform.",
    };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Create a new tenant/salon (Super Admin only)" })
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return {
      message: "Tenant created successfully.",
      tenant: createTenantDto,
    };
  }
}
