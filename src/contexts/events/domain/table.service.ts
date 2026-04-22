import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";

import { CreateTableDto } from "../api/dto/create-table.dto";
import { EventService } from "./event.service";
import { Table } from "./table.entity";

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly eventService: EventService,
  ) {}

  async findAll(
    tenantId: string,
    eventId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Table>> {
    // Ensure the event belongs to the tenant
    await this.eventService.findOne(eventId, tenantId);

    const [data, total] = await this.tableRepository.findAndCount({
      where: { eventId },
      order: { name: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
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

  async create(tenantId: string, eventId: string, dto: CreateTableDto) {
    // Ensure the event belongs to the tenant
    const event = await this.eventService.findOne(eventId, tenantId);

    // Validate table limit
    if (event.maxTableCount > 0) {
      const currentCount = await this.tableRepository.count({
        where: { eventId },
      });
      if (currentCount >= event.maxTableCount) {
        throw new BadRequestException(
          `Maximum table limit reached for this event (${event.maxTableCount})`,
        );
      }
    }

    const table = this.tableRepository.create({
      ...dto,
      eventId: event.id,
    });
    return this.tableRepository.save(table);
  }

  async findOne(tenantId: string, eventId: string, tableId: string) {
    // Ensure the event belongs to the tenant
    await this.eventService.findOne(eventId, tenantId);

    const table = await this.tableRepository.findOne({
      where: { id: tableId, eventId },
    });

    if (!table) {
      throw new NotFoundException(
        `Table with ID ${tableId} not found for this event`,
      );
    }

    return table;
  }

  async remove(tenantId: string, eventId: string, tableId: string) {
    const table = await this.findOne(tenantId, eventId, tableId);
    return this.tableRepository.remove(table);
  }
}
