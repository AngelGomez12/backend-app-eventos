import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags, ApiOkResponse, ApiNotFoundResponse } from "@nestjs/swagger";
import { GuestService } from "../domain/guest.service";

@ApiTags("Public")
@Controller("public/guests")
export class PublicGuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get(":guestId/invitation")
  @ApiOperation({
    summary: "Get public invitation details",
    description: "Retrieves invitation details for a guest without authentication.",
  })
  @ApiParam({
    name: "guestId",
    description: "The unique identifier of the guest (UUID)",
  })
  @ApiOkResponse({ description: "Invitation details retrieved successfully." })
  @ApiNotFoundResponse({ description: "Guest not found." })
  getInvitation(@Param("guestId") guestId: string) {
    return this.guestService.findOnePublic(guestId);
  }
}
