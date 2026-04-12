import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Event } from "@/contexts/events/domain/event.entity";
import { User } from "@/contexts/users/domain/user.entity";

export enum SubscriptionPlan {
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

export enum TenantStatus {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_PAYMENT = "PENDING_PAYMENT",
}

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ==========================================
  // 1. BASIC DATA & WHITE-LABELING
  // ==========================================
  @Column({ type: "varchar", length: 150, nullable: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: "varchar", unique: true, nullable: true })
  slug: string; // Ej: los-pinos

  @Column({ type: "varchar", unique: true, nullable: true })
  customDomain: string;

  @Column({ type: "varchar", nullable: true })
  logoUrl: string;

  @Column({ type: "varchar", nullable: true })
  faviconUrl: string;

  @Column({ type: "varchar", length: 7, default: "#4F46E5" })
  primaryColor: string;

  // ==========================================
  // 2. LOCATION
  // ==========================================
  @Column({ type: "varchar", nullable: true })
  address: string;

  @Column({ type: "varchar", nullable: true })
  city: string;

  @Column({ type: "varchar", nullable: true })
  country: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number;

  // ==========================================
  // 3. CONTACT & SOCIAL MEDIA
  // ==========================================
  @Column({ type: "varchar", nullable: true })
  contactPhone: string;

  @Column({ type: "varchar", nullable: true })
  contactEmail: string;

  @Column({ type: "jsonb", nullable: true })
  socialLinks: Record<string, string>; // { instagram: '...', tiktok: '...' }

  @Column({ type: "varchar", nullable: true })
  website: string;

  // ==========================================
  // 4. BUSINESS & REGIONAL CONFIG
  // ==========================================
  @Column({ type: "int", default: 0 })
  maxGuestCapacity: number;

  @Column({ type: "varchar", default: "America/Montevideo" })
  timezone: string;

  @Column({ type: "varchar", length: 3, default: "UYU" })
  defaultCurrency: string;

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, unknown>;

  // ==========================================
  // 5. SAAS BILLING & SUBSCRIPTION
  // ==========================================
  @Column({ type: "varchar", nullable: true })
  taxId: string;

  @Column({ type: "varchar", nullable: true })
  legalName: string;

  @Column({
    type: "enum",
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({ type: "varchar", nullable: true })
  stripeCustomerId: string;

  @Column({ type: "varchar", nullable: true })
  mercadoPagoId: string;

  @Column({ type: "varchar", nullable: true })
  lastPaymentId: string;

  @Column({ type: "timestamp", nullable: true })
  subscriptionEndDate: Date;

  @Column({
    type: "enum",
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  // ==========================================
  // 6. RELATIONS
  // ==========================================
  @OneToMany(() => User, (user: User) => user.tenant)
  users: User[];

  @OneToMany(() => Event, (event: Event) => event.tenant)
  events: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
