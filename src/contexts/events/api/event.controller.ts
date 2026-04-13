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
import { CurrentUser } from "@/contexts/auth/decorators/current-user.decorator";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventStatusDto } from "./dto/update-event-status.dto";
import { CreateEventPaymentDto } from "./dto/create-event-payment.dto";
import { UpdateEventPriceDto } from "./dto/update-event-price.dto";
import { EventService } from "../domain/event.service";

@ApiTags("Events")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("events")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "List events",
    description:
      "Retrieves events associated with the current tenant. Organizers see only their own events, while Salon Admins see all events in the tenant.",
  })
  async getEvents(@CurrentTenant() tenantId: string, @CurrentUser() user: any) {
    return this.eventService.findAll(tenantId, user);
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
  async getEventById(@Param("id") id: string, @CurrentTenant() tenantId: string) {
    return this.eventService.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Create a new event",
    description: "Registers a new event within the current tenant.",
  })
  async createEvent(
    @CurrentTenant() tenantId: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.create(tenantId, createEventDto);
  }

  @Patch(":id/status")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Update event status" })
  async updateEventStatus(
    @Param("id") id: string,
    @CurrentTenant() tenantId: string,
    @Body() updateEventStatusDto: UpdateEventStatusDto,
  ) {
    return this.eventService.updateStatus(id, tenantId, updateEventStatusDto);
  }

  @Patch(":id/price")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Update base price for an event" })
  async updateEventPrice(
    @Param("id") id: string,
    @CurrentTenant() tenantId: string,
    @Body() updateEventPriceDto: UpdateEventPriceDto,
  ) {
    return this.eventService.updatePrice(id, tenantId, updateEventPriceDto);
  }

  @Post(":id/payments")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Register a new payment for the event" })
  async addPayment(
    @Param("id") id: string,
    @CurrentTenant() tenantId: string,
    @Body() createPaymentDto: CreateEventPaymentDto,
  ) {
    return this.eventService.addPayment(id, tenantId, createPaymentDto);
  }

  @Delete(":id/payments/:paymentId")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Remove a registered payment" })
  async removePayment(
    @Param("id") id: string,
    @Param("paymentId") paymentId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.eventService.removePayment(id, paymentId, tenantId);
  }
}