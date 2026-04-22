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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { GlobalNotification } from "../domain/notification.entity";
import { NotificationService } from "../domain/notification.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { FilterNotificationDto } from "./dto/filter-notification.dto";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "Get all active global notifications" })
  async getActive() {
    return this.notificationService.findActive();
  }

  @Get("all")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all notifications (Super Admin only)" })
  async getAll(@Query() filterDto: FilterNotificationDto) {
    return this.notificationService.findAll(filterDto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Create a global notification (Super Admin only)" })
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Update a notification (Super Admin only)" })
  async update(
    @Param("id") id: string,
    @Body() dto: Partial<GlobalNotification>,
  ) {
    return this.notificationService.update(id, dto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Delete a notification (Super Admin only)" })
  async remove(@Param("id") id: string) {
    return this.notificationService.remove(id);
  }
}
