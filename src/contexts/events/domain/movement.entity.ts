import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Event } from "./event.entity";

export enum MovementType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

@Entity("event_movements")
export class EventMovement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  concept: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: "timestamp" })
  date: Date;

  @Column()
  eventId: string;

  @ManyToOne("Event", "movements", { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @CreateDateColumn()
  createdAt: Date;
}
