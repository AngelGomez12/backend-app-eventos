import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";

export enum PaymentMethod {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  MERCADO_PAGO = "MERCADO_PAGO",
  OTHER = "OTHER",
}

@Entity("event_payments")
export class EventPayment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  method: PaymentMethod;

  @Column({ type: "timestamp" })
  paymentDate: Date;

  @Column({ type: "varchar", nullable: true })
  referenceNumber: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column()
  eventId: string;

  @ManyToOne("Event", (event: Event) => event.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @CreateDateColumn()
  createdAt: Date;
}