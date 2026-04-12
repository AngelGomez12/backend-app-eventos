import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

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
  @ApiOperation({
    summary: "List users for a specific tenant",
    description:
      "Retrieves all users belonging to the current tenant. Restricted to Salon Admins.",
  })
  @ApiOkResponse({ description: "List of users retrieved successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({
    description: "Insufficient permissions (Salon Admin required).",
  })
  getTenantUsers(@CurrentTenant() tenantId: string) {
    // Return mock since we don't have UserService yet
    return {
      message: "List of users for tenant (Row-Level Security applied).",
      tenantId,
    };
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({
    summary: "Create a new user inside the tenant",
    description:
      "Creates a new user (usually an organizer) associated with the current tenant. Restricted to Salon Admins.",
  })
  @ApiCreatedResponse({ description: "User created successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({
    description: "Insufficient permissions (Salon Admin required).",
  })
  createUser(
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
