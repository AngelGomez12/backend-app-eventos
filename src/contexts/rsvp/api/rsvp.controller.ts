import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { ConfirmRsvpDto } from "./dto/confirm-rsvp.dto";

@ApiTags("RSVP (Public)")
@Controller("rsvp")
export class RsvpController {
  @Get(":token")
  @ApiOperation({
    summary: "Get invitation details (Public)",
    description: "Retrieves invitation data using a unique token. Used to show the confirmation screen to guests." 
  })
  @ApiParam({ name: "token", description: "The unique token provided in the guest's invitation link." })
  @ApiOkResponse({ description: "Invitation data retrieved successfully." })
  @ApiNotFoundResponse({ description: "Token not found or invitation expired." })
  async getInvitation(@Param("token") token: string) {
    return {
      message: `Invitation data for token: ${token}`,
    };
  }

  @Post(":token/confirm")
  @ApiOperation({ 
    summary: "Confirm or decline attendance (Public)",
    description: "Allows a guest to submit their RSVP status using their unique token." 
  })
  @ApiParam({ name: "token", description: "The unique token provided in the guest's invitation link." })
  @ApiOkResponse({ description: "RSVP status updated successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiNotFoundResponse({ description: "Token not found or invitation expired." })
  async confirmRsvp(
    @Param("token") token: string,
    @Body() confirmDto: ConfirmRsvpDto,
  ) {
    return {
      message: `RSVP updated for token: ${token}`,
      newStatus: confirmDto.attendanceStatus,
    };
  }
}
