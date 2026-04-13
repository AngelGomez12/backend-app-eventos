import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./audit-log.entity";

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(data: Partial<AuditLog>) {
    const log = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(log);
  }

  async findAll(page = 1, limit = 50) {
    const [data, total] = await this.auditLogRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByTenant(tenantId: string, page = 1, limit = 10) {
    const [data, total] = await this.auditLogRepository.findAndCount({
      where: { tenantId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}