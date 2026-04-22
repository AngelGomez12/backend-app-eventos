import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuditLogController } from "./api/audit-log.controller";
import { AuditLog } from "./domain/audit-log.entity";
import { AuditLogService } from "./domain/audit-log.service";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogService],
  controllers: [AuditLogController],
  exports: [AuditLogService],
})
export class AuditModule {}
