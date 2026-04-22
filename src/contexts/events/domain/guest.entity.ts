import type { Event } from "@/contexts/events/domain/event.entity";
import type { Table } from "@/contexts/events/domain/table.entity";

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum AttendanceStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
}

@Entity("guests")
export class Guest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fullName: string;

  @Column({
    type: "enum",
    enum: AttendanceStatus,
    default: AttendanceStatus.PENDING,
  })
  attendanceStatus: AttendanceStatus;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  dietaryRestrictions?: string;

  @Column()
  eventId: string;

  @ManyToOne("Event", (event: Event) => event.guests, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column({ nullable: true })
  tableId?: string;

  @ManyToOne("Table", (table: Table) => table.guests, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "tableId" })
  table?: Table;
}
