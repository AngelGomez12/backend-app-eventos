import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Event } from "@/contexts/events/domain/event.entity";
import { User } from "@/contexts/users/domain/user.entity";

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  salonName: string;

  @Column({ unique: true })
  customDomain: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user: User) => user.tenant)
  users: User[];

  @OneToMany(() => Event, (event: Event) => event.tenant)
  events: Event[];
}
