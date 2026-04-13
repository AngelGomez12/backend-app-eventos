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
import { UserService } from "../domain/user.service";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({
    summary: "List users for a specific tenant",
    description:
      "Retrieves all users belonging to the current tenant. Restricted to Salon Admins.",
  })
  async getTenantUsers(@CurrentTenant() tenantId: string) {
    return this.userService.findAll(tenantId);
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({
    summary: "Create a new user inside the tenant",
    description:
      "Creates a new user (usually an organizer) associated with the current tenant. Restricted to Salon Admins.",
  })
  async createUser(
    @CurrentTenant() tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.create(tenantId, createUserDto);
  }
}