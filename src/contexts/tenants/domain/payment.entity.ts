import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { SubscriptionPlan, Tenant } from "./tenant.entity";

@Entity("tenant_payments")
export class TenantPayment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Index({ unique: true })
  @Column()
  externalPaymentId: string; // Mercado Pago ID

  @Column({ type: "enum", enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @CreateDateColumn()
  paymentDate: Date;
}
