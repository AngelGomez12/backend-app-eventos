import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";

import { CreateMovementDto } from "../api/dto/create-movement.dto";
import { EventService } from "./event.service";
import { EventMovement } from "./movement.entity";

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(EventMovement)
    private readonly movementRepository: Repository<EventMovement>,
    private readonly eventService: EventService,
  ) {}

  async findAll(
    tenantId: string,
    eventId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<EventMovement>> {
    // Ensure event belongs to tenant
    await this.eventService.findOne(eventId, tenantId);

    const [data, total] = await this.movementRepository.findAndCount({
      where: { eventId },
      order: { date: "DESC", createdAt: "DESC" },
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

  async create(tenantId: string, eventId: string, dto: CreateMovementDto) {
    // Ensure event belongs to tenant
    const event = await this.eventService.findOne(eventId, tenantId);

    const movement = this.movementRepository.create({
      ...dto,
      eventId: event.id,
    });
    return this.movementRepository.save(movement);
  }

  async remove(tenantId: string, eventId: string, movementId: string) {
    // Ensure event belongs to tenant
    await this.eventService.findOne(eventId, tenantId);

    const movement = await this.movementRepository.findOne({
      where: { id: movementId, eventId },
    });

    if (!movement) {
      throw new NotFoundException(`Movement with ID ${movementId} not found`);
    }

    return this.movementRepository.remove(movement);
  }
}
