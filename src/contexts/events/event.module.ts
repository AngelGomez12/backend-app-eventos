import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventController } from "./api/event.controller";
import { GuestController } from "./api/guest.controller";
import { MovementController } from "./api/movement.controller";
import { TableController } from "./api/table.controller";
import { Event } from "./domain/event.entity";
import { EventService } from "./domain/event.service";
import { EventPayment } from "./domain/event-payment.entity";
import { Guest } from "./domain/guest.entity";
import { GuestService } from "./domain/guest.service";
import { EventMovement } from "./domain/movement.entity";
import { MovementService } from "./domain/movement.service";
import { Table } from "./domain/table.entity";
import { TableService } from "./domain/table.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Guest,
      Table,
      EventPayment,
      EventMovement,
    ]),
  ],
  controllers: [
    EventController,
    GuestController,
    TableController,
    MovementController,
  ],
  providers: [EventService, GuestService, TableService, MovementService],
  exports: [
    TypeOrmModule,
    EventService,
    GuestService,
    TableService,
    MovementService,
  ],
})
export class EventModule {}
