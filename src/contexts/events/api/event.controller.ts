import {
  Body,
  Controller,
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
import { CurrentUser } from "@/contexts/auth/decorators/current-user.decorator";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventStatusDto } from "./dto/update-event-status.dto";

@ApiTags("Events")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("events")
export class EventController {
  @Get()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "List events",
    description:
      "Retrieves events associated with the current tenant. Organizers see only their own events, while Salon Admins see all events in the tenant.",
  })
  @ApiOkResponse({ description: "List of events retrieved successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  getEvents(@CurrentTenant() tenantId: string, @CurrentUser() user: unknown) {
    return {
      message:
        "Listing events. If Organizer, only their events. If Admin, all tenant events.",
      tenantId,
      userRole: (user as { role: UserRole }).role,
    };
  }

  @Get(":id")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Get event details",
    description:
      "Retrieves detailed information about a specific event. Ensures the event belongs to the current tenant.",
  })
  @ApiParam({
    name: "id",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiOkResponse({ description: "Event details retrieved successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({
    description: "Insufficient permissions or access to another tenant's data.",
  })
  getEventById(@Param("id") id: string, @CurrentTenant() tenantId: string) {
    return {
      message: `Details for event ${id} ensuring it belongs to tenant ${tenantId}`,
    };
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Create a new event",
    description: "Registers a new event within the current tenant.",
  })
  @ApiCreatedResponse({ description: "Event created successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  createEvent(
    @CurrentTenant() tenantId: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return {
      message: "Event created successfully.",
      tenantId,
      event: createEventDto,
    };
  }

  @Patch(":id/status")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Update event status",
    description:
      "Changes the status (e.g., from Pending to Confirmed) of a specific event.",
  })
  @ApiParam({
    name: "id",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiOkResponse({ description: "Event status updated successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  updateEventStatus(
    @Param("id") id: string,
    @CurrentTenant() tenantId: string,
    @Body() updateEventStatusDto: UpdateEventStatusDto,
  ) {
    return {
      message: `Event ${id} status updated.`,
      tenantId,
      newStatus: updateEventStatusDto.status,
    };
  }
}
