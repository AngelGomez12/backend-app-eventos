import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";

import { PaginatedResponse } from "@/contexts/shared/domain/pagination.interface";

import { CreateUserDto } from "../api/dto/create-user.dto";
import { User, UserRole } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<User>> {
    const [data, total] = await this.userRepository.findAndCount({
      where: { tenantId },
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

  async findOne(id: string, tenantId: string) {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password || "Password123!", 10);
    const user = this.userRepository.create({
      ...dto,
      passwordHash,
      tenantId,
    });
    return this.userRepository.save(user);
  }
}
