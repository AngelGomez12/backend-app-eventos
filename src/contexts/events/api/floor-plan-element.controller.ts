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
import { User, UserRole } from "@/contexts/users/domain/user.entity";

import { FloorPlanElementService } from "../domain/floor-plan-element.service";
import { CreateFloorPlanElementDto, UpdateFloorPlanElementDto } from "./dto/create-floor-plan-element.dto";

@ApiTags("Floor Plan Elements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("events/:eventId/floor-plan-elements")
export class FloorPlanElementController {
  constructor(private readonly elementService: FloorPlanElementService) {}

  @Get()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Get all floor plan elements for an event" })
  @ApiParam({ name: "eventId", description: "Event ID (UUID)" })
  getElements(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.elementService.findAll(tenantId, eventId);
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Create a floor plan element" })
  @ApiParam({ name: "eventId", description: "Event ID (UUID)" })
  createElement(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateFloorPlanElementDto,
  ) {
    return this.elementService.create(tenantId, eventId, dto, user.role);
  }

  @Patch(":elementId")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Update a floor plan element" })
  @ApiParam({ name: "eventId", description: "Event ID (UUID)" })
  @ApiParam({ name: "elementId", description: "Element ID (UUID)" })
  updateElement(
    @Param("eventId") eventId: string,
    @Param("elementId") elementId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateFloorPlanElementDto,
  ) {
    return this.elementService.update(tenantId, eventId, elementId, dto, user.role);
  }

  @Delete(":elementId")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({ summary: "Remove a floor plan element" })
  @ApiParam({ name: "eventId", description: "Event ID (UUID)" })
  @ApiParam({ name: "elementId", description: "Element ID (UUID)" })
  deleteElement(
    @Param("eventId") eventId: string,
    @Param("elementId") elementId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
  ) {
    return this.elementService.remove(tenantId, eventId, elementId, user.role);
  }
}
