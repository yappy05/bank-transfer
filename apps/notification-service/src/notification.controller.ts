import { Body, Controller, Headers, Logger, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationGateway } from './notification.gateway';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post()
  public sendNotification(@Body() data: { user_id: string }) {
    this.notificationGateway.emitToUser(data.user_id, 'notification', {
      data: 'hello',
    });
    this.logger.log(
      `Client id: ${data.user_id}, got ws event: notification, data: 'hello'`,
    );
  }

  @EventPattern('notification')
  public async sendNotification2(
    @Payload() data: { senderId: string; recipientId: string; amount: number },
  ) {
    const { senderId, recipientId, amount } = data;
    this.notificationGateway.emitToUser(data.recipientId, 'notification', {
      data: 'hello',
    });
    this.logger.log(
      `Client id: ${data.senderId}, got ws event: notification, data: 'hello'`,
    );
    await this.notificationService.saveTransferMoneyDocument({
      senderId,
      recipientId,
      amount,
    });
  }
}
