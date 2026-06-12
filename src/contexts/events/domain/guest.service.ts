import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";
import { NotificationService } from "@/contexts/shared/infrastructure/notifications/notification.service";

import { CreateGuestDto } from "../api/dto/create-guest.dto";
import { UpdateGuestDto } from "../api/dto/update-guest.dto";
import { EventService } from "./event.service";
import { Guest } from "./guest.entity";

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(
    tenantId: string,
    eventId: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<Guest>> {
    // Ensure the event belongs to the tenant
    await this.eventService.findOne(eventId, tenantId);

    const where: FindOptionsWhere<Guest> = { eventId };
    if (search) {
      where.fullName = ILike(`%${search}%`);
    }

    const [data, total] = await this.guestRepository.findAndCount({
      where,
      order: { fullName: "ASC" },
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

  async create(tenantId: string, eventId: string, dto: CreateGuestDto) {
    // Ensure the event belongs to the tenant
    const event = await this.eventService.findOne(eventId, tenantId);

    const guest = this.guestRepository.create({
      ...dto,
      eventId: event.id,
    });
    return this.guestRepository.save(guest);
  }

  async findOne(tenantId: string, eventId: string, guestId: string) {
    // Ensure the event belongs to the tenant
    await this.eventService.findOne(eventId, tenantId);

    const guest = await this.guestRepository.findOne({
      where: { id: guestId, eventId },
    });

    if (!guest) {
      throw new NotFoundException(
        `Guest with ID ${guestId} not found for this event`,
      );
    }

    return guest;
  }

  async update(
    tenantId: string,
    eventId: string,
    guestId: string,
    dto: UpdateGuestDto,
  ) {
    const guest = await this.findOne(tenantId, eventId, guestId);
    Object.assign(guest, dto);
    return this.guestRepository.save(guest);
  }

  async remove(tenantId: string, eventId: string, guestId: string) {
    const guest = await this.findOne(tenantId, eventId, guestId);
    return this.guestRepository.remove(guest);
  }

  async findOnePublic(guestId: string) {
    const guest = await this.guestRepository.findOne({
      where: { id: guestId },
      relations: ["event", "event.tenant"],
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }

    return guest;
  }

  async sendTicket(tenantId: string, eventId: string, guestId: string) {
    const guest = await this.guestRepository.findOne({
      where: { id: guestId, eventId },
      relations: ["event", "event.tenant"],
    });

    if (!guest) {
      throw new NotFoundException("Guest not found");
    }

    if (!guest.email) {
      throw new BadRequestException("Guest has no email address");
    }

    await this.notificationService.sendGuestTicket(
      guest,
      guest.event,
      guest.event.tenant,
    );
  }
}
