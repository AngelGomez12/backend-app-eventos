import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";

import { AuditLog } from "./audit-log.entity";

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  search?: string;
}

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

  async findAll(
    filters: AuditLogFilters = {},
  ): Promise<PaginatedResponse<AuditLog>> {
    const { page = 1, limit = 10 } = filters;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder("auditLog")
      .orderBy("auditLog.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.search) {
      queryBuilder.andWhere(
        "(auditLog.action ILIKE :search OR auditLog.entity ILIKE :search OR auditLog.userEmail ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

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

  async findByTenant(
    tenantId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<AuditLog>> {
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
