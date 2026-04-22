import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Guest } from "@/contexts/events/domain/guest.entity";

import { RsvpController } from "./api/rsvp.controller";
import { RsvpService } from "./domain/rsvp.service";

@Module({
  imports: [TypeOrmModule.forFeature([Guest])],
  controllers: [RsvpController],
  providers: [RsvpService],
})
export class RsvpModule {}
