import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateFloorPlanElementDto, UpdateFloorPlanElementDto } from "../api/dto/create-floor-plan-element.dto";
import { FloorPlanElement } from "./floor-plan-element.entity";
import { EventService } from "./event.service";
import { UserRole } from "@/contexts/users/domain/user.entity";

@Injectable()
export class FloorPlanElementService {
  constructor(
    @InjectRepository(FloorPlanElement)
    private readonly elementRepository: Repository<FloorPlanElement>,
    private readonly eventService: EventService,
  ) {}

  async findAll(tenantId: string, eventId: string) {
    await this.eventService.findOne(eventId, tenantId);
    return this.elementRepository.find({
      where: { eventId },
      order: { order: "ASC" },
    });
  }

  async create(tenantId: string, eventId: string, dto: CreateFloorPlanElementDto, userRole: UserRole) {
    await this.eventService.findOne(eventId, tenantId);

    // Only SALON_ADMIN can create structural elements
    if (dto.isStructural && userRole !== UserRole.SALON_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only Salon Admins can create structural elements");
    }

    const element = this.elementRepository.create({
      ...dto,
      eventId,
    });
    return this.elementRepository.save(element);
  }

  async update(
    tenantId: string,
    eventId: string,
    elementId: string,
    dto: UpdateFloorPlanElementDto,
    userRole: UserRole,
  ) {
    const element = await this.findOne(tenantId, eventId, elementId);

    // Restriction: Only SALON_ADMIN can modify structural elements or change structural status
    if (element.isStructural && userRole !== UserRole.SALON_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("You don't have permission to modify this structural element");
    }

    if (dto.isStructural !== undefined && 
        dto.isStructural !== element.isStructural && 
        userRole !== UserRole.SALON_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only Salon Admins can change structural status");
    }

    Object.assign(element, dto);
    return this.elementRepository.save(element);
  }

  async findOne(tenantId: string, eventId: string, elementId: string) {
    await this.eventService.findOne(eventId, tenantId);
    const element = await this.elementRepository.findOne({
      where: { id: elementId, eventId },
    });

    if (!element) {
      throw new NotFoundException(`Floor plan element with ID ${elementId} not found`);
    }

    return element;
  }

  async remove(tenantId: string, eventId: string, elementId: string, userRole: UserRole) {
    const element = await this.findOne(tenantId, eventId, elementId);

    if (element.isStructural && userRole !== UserRole.SALON_ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("You don't have permission to remove this structural element");
    }

    return this.elementRepository.remove(element);
  }
}
