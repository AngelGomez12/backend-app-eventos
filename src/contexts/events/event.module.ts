import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventController } from "./api/event.controller";
import { GuestController } from "./api/guest.controller";
import { Event } from "./domain/event.entity";
import { Guest } from "./domain/guest.entity";
import { EventPayment } from "./domain/event-payment.entity";
import { EventService } from "./domain/event.service";

@Module({
  imports: [TypeOrmModule.forFeature([Event, Guest, EventPayment])],
  controllers: [EventController, GuestController],
  providers: [EventService],
  exports: [TypeOrmModule, EventService],
})
export class EventModule {}