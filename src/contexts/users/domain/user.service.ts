import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "./user.entity";
import { CreateUserDto } from "../api/dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(tenantId: string) {
    return this.userRepository.find({
      where: { tenantId },
      order: { fullName: "ASC" },
    });
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