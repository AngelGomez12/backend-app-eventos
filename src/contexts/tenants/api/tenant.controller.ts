import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { TenantService } from "../domain/tenant.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { Tenant } from "../domain/tenant.entity";

@ApiTags("Tenants")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ 
    summary: "List all tenants",
    description: "Returns a paginated list of all tenants registered in the system. Restricted to Super Admins." 
  })
  @ApiOkResponse({ 
    description: "List of tenants retrieved successfully.",
    type: [Tenant]
  })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions (Super Admin required)." })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (defaults to 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Rows per page (defaults to 10)",
  })
  async getAllTenants(@Query("page") page = 1, @Query("limit") limit = 10) {
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));

    return this.tenantService.findAll(pageNumber, limitNumber);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ 
    summary: "Create a new tenant",
    description: "Creates a new salon/tenant with its branding, location, and business configuration. Slug is auto-generated if not provided." 
  })
  @ApiCreatedResponse({ 
    description: "Tenant created successfully.",
    type: Tenant
  })
  @ApiBadRequestResponse({ description: "Invalid input data (validation failed)." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions (Super Admin required)." })
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    const savedTenant = await this.tenantService.create(createTenantDto);

    return {
      message: "Tenant created successfully.",
      tenant: savedTenant,
    };
  }
}
