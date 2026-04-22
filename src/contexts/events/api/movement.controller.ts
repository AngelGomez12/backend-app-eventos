import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
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

import { MovementService } from "../domain/movement.service";
import { CreateMovementDto } from "./dto/create-movement.dto";
import { FilterMovementDto } from "./dto/filter-movement.dto";

@ApiTags("Movements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("events/:eventId/movements")
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Get()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "List all financial movements for an event",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiOkResponse({ description: "List of movements retrieved successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  getMovements(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @Query() filterDto: FilterMovementDto,
  ) {
    return this.movementService.findAll(
      tenantId,
      eventId,
      filterDto.page,
      filterDto.limit,
    );
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Register a new movement (income/expense)",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiCreatedResponse({ description: "Movement created successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  addMovement(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @Body() createMovementDto: CreateMovementDto,
  ) {
    return this.movementService.create(tenantId, eventId, createMovementDto);
  }

  @Delete(":movementId")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "Remove a registered movement",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiParam({
    name: "movementId",
    description: "The unique identifier of the movement (UUID)",
  })
  @ApiOkResponse({ description: "Movement removed successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  deleteMovement(
    @Param("eventId") eventId: string,
    @Param("movementId") movementId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.movementService.remove(tenantId, eventId, movementId);
  }
}
