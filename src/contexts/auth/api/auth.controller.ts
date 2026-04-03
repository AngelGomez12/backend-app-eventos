import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

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
      "Authenticates a user and returns a JWT token for subsequent requests. Supports custom domains for multi-tenancy.",
  })
  @ApiOkResponse({ description: "Successfully logged in and token generated." })
  @ApiUnauthorizedResponse({ description: "Invalid email or password." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
