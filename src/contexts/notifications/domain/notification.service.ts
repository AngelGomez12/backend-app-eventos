import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";

import { CreateNotificationDto } from "../api/dto/create-notification.dto";
import { GlobalNotification } from "./notification.entity";

export interface NotificationsFilters {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(GlobalNotification)
    private readonly notificationRepository: Repository<GlobalNotification>,
  ) {}

  async findAll(
    filters: NotificationsFilters = {},
  ): Promise<PaginatedResponse<GlobalNotification>> {
    const { page = 1, limit = 10 } = filters;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder("notification")
      .orderBy("notification.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.search) {
      queryBuilder.andWhere("notification.title ILIKE :search", {
        search: `%${filters.search}%`,
      });
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
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    Object.assign(notification, dto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    return this.notificationRepository.remove(notification);
  }
}
