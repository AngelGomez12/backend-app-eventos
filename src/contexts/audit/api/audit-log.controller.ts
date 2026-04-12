import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/contexts/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/contexts/auth/guards/roles.guard";
import { Roles } from "@/contexts/auth/decorators/roles.decorator";
import { UserRole } from "@/contexts/users/domain/user.entity";
import { AuditLogService } from "../domain/audit-log.service";

@ApiTags("Audit Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: "Get all audit logs (Super Admin only)" })
  async getAll(
    @Query("page") page = 1,
    @Query("limit") limit = 50,
  ) {
    return this.auditLogService.findAll(Number(page), Number(limit));
  }
}