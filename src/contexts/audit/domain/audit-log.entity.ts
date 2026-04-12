import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column()
  action: string; // e.g., "CREATE", "UPDATE", "DELETE", "LOGIN", "IMPERSONATE"

  @Column()
  entity: string; // e.g., "Tenant", "Event", "User", "Notification"

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: "jsonb", nullable: true })
  payload: any; // Request body or relevant data

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}