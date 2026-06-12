import type { Event } from "@/contexts/events/domain/event.entity";

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum FloorPlanElementType {
  DIVIDER = "divider",
  TEXT = "text",
  SHAPE = "shape",
  STAGE = "stage",
}

@Entity("floor_plan_elements")
export class FloorPlanElement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: FloorPlanElementType,
  })
  type: FloorPlanElementType;

  @Column({ type: "text", nullable: true })
  content?: string;

  @Column({ type: "float" })
  x: number;

  @Column({ type: "float" })
  y: number;

  @Column({ type: "float" })
  width: number;

  @Column({ type: "float" })
  height: number;

  @Column({ type: "float", default: 0 })
  rotation: number;

  @Column({ type: "varchar", default: "#cccccc" })
  color: string;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({ type: "boolean", default: false })
  isStructural: boolean;

  @Column()
  eventId: string;

  @ManyToOne("Event", "floorPlanElements", { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;
}
