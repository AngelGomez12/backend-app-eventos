import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { CurrentUser } from "@/contexts/auth/decorators/current-user.decorator";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { User, UserRole } from "@/contexts/users/domain/user.entity";

import { TableService } from "../domain/table.service";
import { CreateTableDto } from "./dto/create-table.dto";
import { FilterTableDto } from "./dto/filter-table.dto";
import { UpdateTablePositionsDto } from "./dto/update-table-positions.dto";

@ApiTags("Tables")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("events/:eventId/tables")
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({
    summary: "List all tables for an event",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiOkResponse({ description: "List of tables retrieved successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  getTables(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @Query() filterDto: FilterTableDto,
  ) {
    return this.tableService.findAll(
      tenantId,
      eventId,
      filterDto.page,
      filterDto.limit,
    );
  }

  @Post()
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({
    summary: "Create a new table",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiCreatedResponse({ description: "Table created successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  addTable(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @Body() createTableDto: CreateTableDto,
  ) {
    return this.tableService.create(tenantId, eventId, createTableDto);
  }

  @Patch("positions")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({
    summary: "Update multiple table positions",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiOkResponse({ description: "Table positions updated successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  patchPositions(
    @Param("eventId") eventId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
    @Body() updatePositionsDto: UpdateTablePositionsDto,
  ) {
    return this.tableService.updatePositions(
      tenantId,
      eventId,
      updatePositionsDto,
      user.role,
    );
  }

  @Patch(":tableId")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({
    summary: "Update an individual table",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiParam({
    name: "tableId",
    description: "The unique identifier of the table (UUID)",
  })
  @ApiOkResponse({ description: "Table updated successfully." })
  @ApiBadRequestResponse({ description: "Invalid input data." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  patchTable(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: User,
    @Body() updateTableDto: Partial<CreateTableDto>,
  ) {
    return this.tableService.update(
      tenantId,
      eventId,
      tableId,
      updateTableDto,
      user.role,
    );
  }

  @Delete(":tableId")
  @Roles(UserRole.SALON_ADMIN)
  @ApiOperation({
    summary: "Remove table",
  })
  @ApiParam({
    name: "eventId",
    description: "The unique identifier of the event (UUID)",
  })
  @ApiParam({
    name: "tableId",
    description: "The unique identifier of the table (UUID)",
  })
  @ApiOkResponse({ description: "Table removed successfully." })
  @ApiUnauthorizedResponse({ description: "Invalid or missing JWT token." })
  @ApiForbiddenResponse({ description: "Insufficient permissions." })
  deleteTable(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.tableService.remove(tenantId, eventId, tableId);
  }
}
