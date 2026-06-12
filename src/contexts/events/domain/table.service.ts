import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource,Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";
import { UserRole } from "@/contexts/users/domain/user.entity";

import { CreateTableDto } from "../api/dto/create-table.dto";
import { UpdateTablePositionsDto } from "../api/dto/update-table-positions.dto";
import { EventService } from "./event.service";
import { Table } from "./table.entity";

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly eventService: EventService,
    private readonly dataSource: DataSource,
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

  async updatePositions(
    tenantId: string,
    eventId: string,
    dto: UpdateTablePositionsDto,
    userRole: UserRole,
  ) {
    await this.eventService.findOne(eventId, tenantId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const position of dto.positions) {
        const table = await this.tableRepository.findOne({
          where: { id: position.id, eventId },
        });

        if (!table) continue;

        // Restriction: Only SALON_ADMIN can move structural tables or change structural status
        if (
          table.isStructural &&
          userRole !== UserRole.SALON_ADMIN &&
          userRole !== UserRole.SUPER_ADMIN
        ) {
          throw new ForbiddenException(
            `You don't have permission to move structural table: ${table.name}`,
          );
        }

        if (
          position.isStructural !== undefined &&
          position.isStructural !== table.isStructural &&
          userRole !== UserRole.SALON_ADMIN &&
          userRole !== UserRole.SUPER_ADMIN
        ) {
          throw new ForbiddenException(
            "Only Salon Admins can change structural status",
          );
        }

        await queryRunner.manager.update(Table, position.id, {
          x: position.x,
          y: position.y,
          rotation: position.rotation,
          ...(position.isStructural !== undefined && {
            isStructural: position.isStructural,
          }),
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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

  async update(
    tenantId: string,
    eventId: string,
    tableId: string,
    dto: Partial<CreateTableDto>,
    userRole: UserRole,
  ) {
    const table = await this.findOne(tenantId, eventId, tableId);

    // Security: Structural tables can only be modified by Salon Admin
    if (table.isStructural && userRole !== UserRole.SALON_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        `You don't have permission to modify structural table: ${table.name}`,
      );
    }

    Object.assign(table, dto);
    return this.tableRepository.save(table);
  }

  async remove(tenantId: string, eventId: string, tableId: string) {
    const table = await this.findOne(tenantId, eventId, tableId);
    return this.tableRepository.remove(table);
  }
}
