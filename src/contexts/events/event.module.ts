import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventController } from "./api/event.controller";
import { GuestController } from "./api/guest.controller";
import { TableController } from "./api/table.controller";
import { MovementController } from "./api/movement.controller";
import { Event } from "./domain/event.entity";
import { Guest } from "./domain/guest.entity";
import { Table } from "./domain/table.entity";
import { EventPayment } from "./domain/event-payment.entity";
import { EventMovement } from "./domain/movement.entity";
import { EventService } from "./domain/event.service";
import { GuestService } from "./domain/guest.service";
import { TableService } from "./domain/table.service";
import { MovementService } from "./domain/movement.service";

@Module({
  imports: [TypeOrmModule.forFeature([Event, Guest, Table, EventPayment, EventMovement])],
  controllers: [EventController, GuestController, TableController, MovementController],
  providers: [EventService, GuestService, TableService, MovementService],
  exports: [TypeOrmModule, EventService, GuestService, TableService, MovementService],
})
export class EventModule {}