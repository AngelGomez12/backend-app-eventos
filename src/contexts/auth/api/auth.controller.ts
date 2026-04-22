import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { AuthService } from "../domain/auth.service";
import { LoginDto } from "./dto/login.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "Login and get a JWT token",
    description:
      "Authenticates a user and returns a JWT token for subsequent requests.",
  })
  @ApiOkResponse({ description: "Successfully logged in and token generated." })
  @ApiUnauthorizedResponse({ description: "Invalid email or password." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("impersonate")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Impersonate a tenant (Super Admin only)",
    description: "Generates a token for an admin user of the specified tenant.",
  })
  async impersonate(@Body("tenantId") tenantId: string) {
    return this.authService.impersonate(tenantId);
  }
}
