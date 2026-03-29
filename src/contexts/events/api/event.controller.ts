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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
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
  @ApiOperation({ summary: "List events based on user role and tenant" })
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
  @ApiOperation({ summary: "Get detailed information about an event" })
  @ApiParam({ name: "id", description: "Event ID" })
  getEventById(@Param("id") id: string, @CurrentTenant() tenantId: string) {
    return {
      message: `Details for event ${id} ensuring it belongs to tenant ${tenantId}`,
    };
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Create a new event" })
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
  @ApiOperation({ summary: "Change the status of an event" })
  @ApiParam({ name: "id", description: "Event ID" })
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
