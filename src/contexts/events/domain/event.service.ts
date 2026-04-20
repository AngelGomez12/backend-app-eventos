import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event, EventStatus } from "./event.entity";
import { EventPayment } from "./event-payment.entity";
import { CreateEventDto } from "../api/dto/create-event.dto";
import { UpdateEventStatusDto } from "../api/dto/update-event-status.dto";
import { CreateEventPaymentDto } from "../api/dto/create-event-payment.dto";
import { UpdateEventPriceDto } from "../api/dto/update-event-price.dto";
import { UpdateTableLimitDto } from "../api/dto/update-table-limit.dto";
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
    
    const totalPaid = event.payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    if (event.status === EventStatus.PENDING_DEPOSIT && totalPaid >= event.basePrice) {
      event.status = EventStatus.CONFIRMED;
    }

    return this.eventRepository.save(event);
  }

  async updateTableLimit(id: string, tenantId: string, dto: UpdateTableLimitDto) {
    const event = await this.findOne(id, tenantId);
    event.maxTableCount = dto.maxTableCount;
    return this.eventRepository.save(event);
  }

  async addPayment(eventId: string, tenantId: string, dto: CreateEventPaymentDto) {
    const event = await this.findOne(eventId, tenantId);
    
    const payment = this.paymentRepository.create({
      ...dto,
      paymentDate: new Date(dto.paymentDate),
      eventId: event.id,
    });

    await this.paymentRepository.save(payment);

    // Re-calculate balance and update status if necessary
    const updatedEvent = await this.findOne(eventId, tenantId);
    const totalPaid = updatedEvent.payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    
    if (updatedEvent.status === EventStatus.PENDING_DEPOSIT && totalPaid >= updatedEvent.basePrice) {
      updatedEvent.status = EventStatus.CONFIRMED;
      await this.eventRepository.save(updatedEvent);
    }

    return payment;
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