import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "./event.entity";
import { EventPayment } from "./event-payment.entity";
import { CreateEventDto } from "../api/dto/create-event.dto";
import { UpdateEventStatusDto } from "../api/dto/update-event-status.dto";
import { CreateEventPaymentDto } from "../api/dto/create-event-payment.dto";
import { UpdateEventPriceDto } from "../api/dto/update-event-price.dto";
import { UserRole } from "@/contexts/users/domain/user.entity";

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventPayment)
    private readonly paymentRepository: Repository<EventPayment>,
  ) {}

  async findAll(tenantId: string, user: any) {
    const query = this.eventRepository.createQueryBuilder("event")
      .where("event.tenantId = :tenantId", { tenantId })
      .leftJoinAndSelect("event.organizer", "organizer");

    if (user.role === UserRole.ORGANIZER) {
      query.andWhere("event.organizerId = :userId", { userId: user.userId || user.id });
    }

    return query.orderBy("event.date", "ASC").getMany();
  }

  async findOne(id: string, tenantId: string) {
    const event = await this.eventRepository.findOne({
      where: { id, tenantId },
      relations: ["organizer", "payments"],
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return event;
  }

  async create(tenantId: string, dto: CreateEventDto) {
    const event = this.eventRepository.create({
      ...dto,
      tenantId,
    });
    return this.eventRepository.save(event);
  }

  async updateStatus(id: string, tenantId: string, dto: UpdateEventStatusDto) {
    const event = await this.findOne(id, tenantId);
    event.status = dto.status;
    return this.eventRepository.save(event);
  }

  async updatePrice(id: string, tenantId: string, dto: UpdateEventPriceDto) {
    const event = await this.findOne(id, tenantId);
    event.basePrice = dto.basePrice;
    return this.eventRepository.save(event);
  }

  async addPayment(eventId: string, tenantId: string, dto: CreateEventPaymentDto) {
    const event = await this.findOne(eventId, tenantId);
    
    const payment = this.paymentRepository.create({
      ...dto,
      paymentDate: new Date(dto.paymentDate),
      eventId: event.id,
    });

    return this.paymentRepository.save(payment);
  }

  async removePayment(eventId: string, paymentId: string, tenantId: string) {
    // Ensure the event belongs to the tenant
    await this.findOne(eventId, tenantId);
    
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, eventId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return this.paymentRepository.remove(payment);
  }
}