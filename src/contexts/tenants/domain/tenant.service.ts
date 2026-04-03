import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateTenantDto } from "../api/dto/create-tenant.dto";
import { Tenant } from "./tenant.entity";

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findAll(page: number, limit: number) {
    const [data, total] = await this.tenantRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: "ASC" },
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

  async create(createTenantDto: CreateTenantDto) {
    const { name, slug } = createTenantDto;

    // Si no viene el slug, lo generamos a partir del name
    const finalSlug = slug || this.generateSlug(name);

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      slug: finalSlug,
    });

    return this.tenantRepository.save(tenant);
  }

  private generateSlug(text: string): string {
    return text
      .normalize("NFD") // Separa los acentos de las letras
      .replace(/[\u0300-\u036f]/g, "") // Remueve los acentos
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remueve caracteres especiales
      .replace(/[\s_-]+/g, "-") // Reemplaza espacios y guiones bajos por un solo guion
      .replace(/^-+|-+$/g, ""); // Remueve guiones al principio y al final
  }
}
