import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentTenant } from "@/contexts/auth/decorators/current-tenant.decorator";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { AuditLogService } from "../domain/audit-log.service";
import { FilterAuditLogDto } from "./dto/filter-audit-log.dto";

@ApiTags("Audit Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all audit logs (Super Admin only)" })
  async getAll(@Query() filterDto: FilterAuditLogDto) {
    return this.auditLogService.findAll(filterDto);
  }

  @Get("me")
  @Roles(UserRole.SALON_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: "Get audit logs for the current tenant" })
  async getMyLogs(
    @CurrentTenant() tenantId: string,
    @Query() filterDto: FilterAuditLogDto,
  ) {
    return this.auditLogService.findByTenant(
      tenantId,
      filterDto.page,
      filterDto.limit,
    );
  }
}
