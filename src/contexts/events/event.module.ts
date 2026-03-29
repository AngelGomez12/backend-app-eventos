import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventController } from "./api/event.controller";
import { GuestController } from "./api/guest.controller";
import { Event } from "./domain/event.entity";
import { Guest } from "./domain/guest.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Event, Guest])],
  controllers: [EventController, GuestController],
  exports: [TypeOrmModule],
})
export class EventModule {}
