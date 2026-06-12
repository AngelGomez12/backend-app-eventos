import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { NotificationService } from "@/contexts/shared/infrastructure/notifications/notification.service";

@Module({
  imports: [ConfigModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
