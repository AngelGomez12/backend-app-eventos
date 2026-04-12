import { ForbiddenException, Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";

import { LoginDto } from "@/contexts/auth/api/dto/login.dto";
import { TenantStatus } from "@/contexts/tenants/domain/tenant.entity";
import { User, UserRole } from "@/contexts/users/domain/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ["tenant"],
    });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // Bloqueo por pago pendiente
      if (user.tenant?.status === TenantStatus.PENDING_PAYMENT) {
        throw new ForbiddenException(
          "Account pending payment. Please complete your subscription payment.",
        );
      }
      // Bloqueo por cuenta suspendida
      if (user.tenant?.status === TenantStatus.SUSPENDED) {
        throw new ForbiddenException(
          "Account suspended. Please contact support.",
        );
      }

      return user;
    }
    return undefined;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateToken(user);
  }

  async impersonate(tenantId: string) {
    // Buscamos un administrador para ese salón
    const user = await this.usersRepository.findOne({
      where: { tenantId, role: UserRole.SALON_ADMIN },
    });

    if (!user) {
      throw new NotFoundException("No admin user found for this tenant");
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}