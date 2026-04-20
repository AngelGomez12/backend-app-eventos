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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { CurrentTenant } from "@/contexts/auth/decorators/current-tenant.decorator";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { CreateGuestDto } from "./dto/create-guest.dto";
import { UpdateGuestDto } from "./dto/update-guest.dto";
import { GuestService } from "../domain/guest.service";

@ApiTags("Guests")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("events/:eventId/guests")
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "List all guests for an event",
    description:
      "Retrieves the guest list for a specific event. Access is restricted to users within the same tenant.",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiOkResponse({ description: "List of guests retrieved successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  getGuests(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.guestService.findAll(tenantId, eventId);
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Add a new guest",
    description: "Adds a new guest to the specified event list.",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiCreatedResponse({ description: "Guest added successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  addGuest(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @Body() createGuestDto: CreateGuestDto,
  ) {
    return this.guestService.create(tenantId, eventId, createGuestDto);
  }

  @Patch(":guestId")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Update guest details",
    description: "Modifies existing guest information.",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiParam({
    name: "guestId",
    description: "The unique identifier of the guest (UUID)",
  })
  @ApiOkResponse({ description: "Guest updated successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  updateGuest(
    @Param("eventId") eventId: string,
    @Param("guestId") guestId: string,
    @CurrentTenant() tenantId: string,
    @Body() updateDto: UpdateGuestDto,
  ) {
    return this.guestService.update(tenantId, eventId, guestId, updateDto);
  }

  @Delete(":guestId")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Remove guest",
    description: "Deletes a guest from the event list.",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiParam({
    name: "guestId",
    description: "The unique identifier of the guest (UUID)",
  })
  @ApiOkResponse({ description: "Guest removed successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  deleteGuest(
    @Param("eventId") eventId: string,
    @Param("guestId") guestId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.guestService.remove(tenantId, eventId, guestId);
  }
}
