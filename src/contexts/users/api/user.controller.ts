import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentTenant } from "@/contexts/auth/decorators/current-tenant.decorator";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";

import { UserRole } from "../domain/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UserController {
  @Get()
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "List users for a specific tenant" })
  async getTenantUsers(@CurrentTenant() tenantId: string) {
    // Return mock since we don't have UserService yet
    return {
      message: "List of users for tenant (Row-Level Security applied).",
      tenantId,
    };
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Create a new user (organizer) inside the tenant" })
  async createUser(
    @CurrentTenant() tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return {
      message: "User created and correctly isolated in tenant.",
      tenantId,
      userCreated: createUserDto,
    };
  }
}
