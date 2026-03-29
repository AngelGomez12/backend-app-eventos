import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { ConfirmRsvpDto } from "./dto/confirm-rsvp.dto";

@ApiTags("RSVP (Public)")
@Controller("rsvp")
export class RsvpController {
  @Get(":token")
  @ApiOperation({
    summary: "Get invitation details to show confirmation screen. (Public)",
  })
  @ApiParam({ name: "token", description: "Invitation Token" })
  async getInvitation(@Param("token") token: string) {
    return {
      message: `Invitation data for token: ${token}`,
    };
  }

  @Post(":token/confirm")
  @ApiOperation({ summary: "Guest confirms or declines attendance. (Public)" })
  @ApiParam({ name: "token", description: "Invitation Token" })
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
