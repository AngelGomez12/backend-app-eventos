import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Guest } from "@/contexts/events/domain/guest.entity";
import { NotificationModule as SharedNotificationModule } from "@/contexts/shared/infrastructure/notifications/notification.module";

import { RsvpController } from "./api/rsvp.controller";
import { RsvpService } from "./domain/rsvp.service";

@Module({
  imports: [TypeOrmModule.forFeature([Guest]), SharedNotificationModule],
  controllers: [RsvpController],
  providers: [RsvpService],
})
export class RsvpModule {}
