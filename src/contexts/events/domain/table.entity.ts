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

@Entity("tables")
export class Table {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  eventId: string;

  @ManyToOne("Event", "tables", { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @OneToMany("Guest", (guest: Guest) => guest.table)
  guests: Guest[];
}
