import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GlobalNotification } from "./domain/notification.entity";
import { NotificationService } from "./domain/notification.service";
import { NotificationController } from "./api/notification.controller";

@Module({
  imports: [TypeOrmModule.forFeature([GlobalNotification])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}