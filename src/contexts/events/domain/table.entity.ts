import type { Event } from "@/contexts/events/domain/event.entity";
import type { Guest } from "@/contexts/events/domain/guest.entity";

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum TableType {
  ROUND = "round",
  SQUARE = "square",
  RECTANGLE = "rectangle",
}

@Entity("tables")
export class Table {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "float", default: 0 })
  x: number;

  @Column({ type: "float", default: 0 })
  y: number;

  @Column({ type: "float", default: 0 })
  rotation: number;

  @Column({
    type: "enum",
    enum: TableType,
    default: TableType.ROUND,
  })
  type: TableType;

  @Column({ type: "int", default: 8 })
  seats: number;

  @Column({ type: "varchar", default: "#ffffff" })
  color: string;

  @Column({ type: "float", default: 1.0 })
  scale: number;

  @Column({ type: "boolean", default: false })
  isStructural: boolean;

  @Column()
  eventId: string;

  @ManyToOne("Event", "tables", { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @OneToMany("Guest", (guest: Guest) => guest.table)
  guests: Guest[];
}
