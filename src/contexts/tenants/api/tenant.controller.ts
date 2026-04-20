import { Body, Controller, Get, Patch, Param, Post, Query, UseGuards, ForbiddenException } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { CurrentTenant } from "@/contexts/auth/decorators/current-tenant.decorator";

import { Tenant, TenantStatus } from "../domain/tenant.entity";
import { TenantService } from "../domain/tenant.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";

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
    description: "Restricted to Super Admins.",
  })
  async getAllTenants(@Query("page") page = 1, @Query("limit") limit = 10) {
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    return this.tenantService.findAll(pageNumber, limitNumber);
  }

  @Get("me")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Get current tenant information" })
  async getMe(@CurrentTenant() tenantId: string) {
    return this.tenantService.findOne(tenantId);
  }

  @Patch("me")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Update current tenant information" })
  async updateMe(
    @CurrentTenant() tenantId: string,
    @Body() updateData: Partial<Tenant>
  ) {
    // Campos prohibidos para el Salon Admin
    const forbiddenFields = ["status", "subscriptionPlan", "subscriptionEndDate", "mercadoPagoId", "isActive"];
    for (const field of forbiddenFields) {
      if (field in updateData) {
        throw new ForbiddenException(`You are not allowed to update the ${field} field`);
      }
    }
    
    return this.tenantService.update(tenantId, updateData);
  }

  @Get("stats")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get tenant statistics for Super Admin dashboard" })
  async getStats() {
    return this.tenantService.getStats();
  }

  @Get(":id")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get tenant details by ID" })
  async getById(@Param("id") id: string) {
    return this.tenantService.findOne(id);
  }

  @Get(":id/payments")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get tenant payment history" })
  async getPayments(@Param("id") id: string) {
    return this.tenantService.findPayments(id);
  }

  @Patch(":id/status")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Update tenant status" })
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: TenantStatus
  ) {
    return this.tenantService.updateStatus(id, status);
  }

  @Patch(":id")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Update tenant data" })
  async updateTenant(
    @Param("id") id: string,
    @Body() updateData: Partial<Tenant>
  ) {
    return this.tenantService.update(id, updateData);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Create a new tenant" })
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    const savedTenant = await this.tenantService.create(createTenantDto);
    return {
      message: "Tenant created successfully.",
      tenant: savedTenant,
    };
  }
}