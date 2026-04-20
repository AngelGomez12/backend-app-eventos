import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Table } from "./table.entity";
import { EventService } from "./event.service";
import { CreateTableDto } from "../api/dto/create-table.dto";

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly eventService: EventService,
  ) {}

  async findAll(tenantId: string, eventId: string) {
    // Ensure the event belongs to the tenant
    await this.eventService.findOne(eventId, tenantId);
    return this.tableRepository.find({
      where: { eventId },
      order: { name: "ASC" },
    });
  }

  async create(tenantId: string, eventId: string, dto: CreateTableDto) {
    // Ensure the event belongs to the tenant
    const event = await this.eventService.findOne(eventId, tenantId);
    
    // Validate table limit
    if (event.maxTableCount > 0) {
      const currentCount = await this.tableRepository.count({ where: { eventId } });
      if (currentCount >= event.maxTableCount) {
        throw new BadRequestException(`Maximum table limit reached for this event (${event.maxTableCount})`);
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
      throw new NotFoundException(`Table with ID ${tableId} not found for this event`);
    }

    return table;
  }

  async remove(tenantId: string, eventId: string, tableId: string) {
    const table = await this.findOne(tenantId, eventId, tableId);
    return this.tableRepository.remove(table);
  }
}
