import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService, NotificationGateway],
})
export class NotificationServiceModule {}
