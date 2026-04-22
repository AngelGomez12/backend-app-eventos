/* eslint-disable node/no-extraneous-import */
import type { Guest } from "@/contexts/events/domain/guest.entity";
import type { Table } from "@/contexts/events/domain/table.entity";
import type { Tenant } from "@/contexts/tenants/domain/tenant.entity";
import type { User } from "@/contexts/users/domain/user.entity";
import type { EventPayment } from "./event-payment.entity";
import type { EventMovement } from "./movement.entity";

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum EventType {
  WEDDING = "WEDDING",
  SWEET_15 = "SWEET_15",
  CORPORATE = "CORPORATE",
  OTHER = "OTHER",
}

export enum EventStatus {
  PENDING_DEPOSIT = "PENDING_DEPOSIT",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  honoreeName: string;

  @Column({
    type: "enum",
    enum: EventType,
    default: EventType.OTHER,
  })
  type: EventType;

  @Column({ type: "timestamp" })
  date: Date;

  @Column({
    type: "enum",
    enum: EventStatus,
    default: EventStatus.PENDING_DEPOSIT,
  })
  status: EventStatus;

  @Column({ type: "int", nullable: true })
  approximateGuestCount: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: "int", default: 0 })
  maxTableCount: number;

  @Column()
  tenantId: string;

  @ManyToOne("Tenant", "events")
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @Column()
  organizerId: string;

  @ManyToOne("User", "events")
  @JoinColumn({ name: "organizerId" })
  organizer: User;

  @OneToMany("Guest", "event")
  guests: Guest[];

  @OneToMany("Table", "event")
  tables: Table[];

  @OneToMany("EventPayment", "event")
  payments: EventPayment[];

  @OneToMany("EventMovement", "event")
  movements: EventMovement[];
}
