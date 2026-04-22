import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NotificationController } from "./api/notification.controller";
import { GlobalNotification } from "./domain/notification.entity";
import { NotificationService } from "./domain/notification.service";

@Module({
  imports: [TypeOrmModule.forFeature([GlobalNotification])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
