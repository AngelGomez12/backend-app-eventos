import type { Event } from "@/contexts/events/domain/event.entity";
import type { Tenant } from "@/contexts/tenants/domain/tenant.entity";

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SALON_ADMIN = "SALON_ADMIN",
  ORGANIZER = "ORGANIZER",
}

@Entity("users")
@Index(["email", "tenantId"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.ORGANIZER,
  })
  role: UserRole;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne("Tenant", (tenant: any) => tenant.users, { nullable: true })
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @OneToMany("Event", (event: any) => event.organizer)
  events: Event[];
}
