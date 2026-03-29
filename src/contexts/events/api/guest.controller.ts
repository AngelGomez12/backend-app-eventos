import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { CurrentTenant } from "@/contexts/auth/decorators/current-tenant.decorator";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { CreateGuestDto } from "./dto/create-guest.dto";

@ApiTags("Guests")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("events/:eventId/guests")
export class GuestController {
  @Get()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "List all guests for an event" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  async getGuests(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: `Fetching guests for event ${eventId}`,
      tenantId,
    };
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Add a new guest to the event list" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  async addGuest(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @Body() createGuestDto: CreateGuestDto,
  ) {
    return {
      message: `Added guest to event ${eventId}`,
      tenantId,
      guest: createGuestDto,
    };
  }

  @Patch(":guestId")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Update guest details" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  @ApiParam({ name: "guestId", description: "Guest ID" })
  async updateGuest(
    @Param("eventId") eventId: string,
    @Param("guestId") guestId: string,
    @CurrentTenant() tenantId: string,
    @Body() updateDto: Partial<CreateGuestDto>,
  ) {
    return {
      message: `Updated guest ${guestId} in event ${eventId}`,
      tenantId,
      updates: updateDto,
    };
  }

  @Delete(":guestId")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Remove guest from the list" })
  @ApiParam({ name: "eventId", description: "Event ID" })
  @ApiParam({ name: "guestId", description: "Guest ID" })
  async deleteGuest(
    @Param("eventId") eventId: string,
    @Param("guestId") guestId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: `Deleted guest ${guestId} from event ${eventId}`,
      tenantId,
    };
  }
}
