import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GlobalNotification } from "./notification.entity";
import { CreateNotificationDto } from "../api/dto/create-notification.dto";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(GlobalNotification)
    private readonly notificationRepository: Repository<GlobalNotification>,
  ) {}

  async findAll() {
    return this.notificationRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findActive() {
    return this.notificationRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async create(dto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(dto);
    return this.notificationRepository.save(notification);
  }

  async update(id: string, dto: Partial<GlobalNotification>) {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    Object.assign(notification, dto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: string) {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    return this.notificationRepository.remove(notification);
  }
}