import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NotificationModule } from "@/contexts/shared/infrastructure/notifications/notification.module";

import { EventController } from "./api/event.controller";
import { FloorPlanElementController } from "./api/floor-plan-element.controller";
import { GuestController } from "./api/guest.controller";
import { MovementController } from "./api/movement.controller";
import { PublicGuestController } from "./api/public-guest.controller";
import { TableController } from "./api/table.controller";
import { Event } from "./domain/event.entity";
import { EventService } from "./domain/event.service";
import { EventPayment } from "./domain/event-payment.entity";
import { FloorPlanElement } from "./domain/floor-plan-element.entity";
import { FloorPlanElementService } from "./domain/floor-plan-element.service";
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
      FloorPlanElement,
    ]),
    NotificationModule,
  ],
  controllers: [
    EventController,
    GuestController,
    TableController,
    MovementController,
    PublicGuestController,
    FloorPlanElementController,
  ],
  providers: [
    EventService,
    GuestService,
    TableService,
    MovementService,
    FloorPlanElementService,
  ],
  exports: [
    TypeOrmModule,
    EventService,
    GuestService,
    TableService,
    MovementService,
    FloorPlanElementService,
  ],
})
export class EventModule {}
