import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { NotificationService } from './notification.service';
import { RpcFilter } from '@app/my-library/common/filters/rpc.filter';

@UseFilters(RpcFilter)
@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  logger: Logger;
  constructor(private readonly notificationService: NotificationService) {
    this.logger = new Logger(NotificationGateway.name);
  }

  @WebSocketServer()
  io: Server;

  afterInit() {
    this.logger.log('Websocket initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client id: ${client.id} disconnected`);
  }

  async handleConnection(client: Socket) {
    const { sockets } = this.io.sockets;
    const token = client.handshake.headers.authorization;
    if (!token) {
      client.disconnect();
      return;
    }
    const result = await this.notificationService.verifyJwt(token);
    if (!result) {
      this.logger.debug(`Client with token ${token} dose not allow connect`);
      client.disconnect(true);
      return;
    }
    await client.join(result.sub);
    this.logger.log(
      `Client id: ${client.id} connected in room ${result.sub}. User id: ${result.sub}`,
    );
    this.logger.debug(`Client auth token: ${token}`);
    this.logger.debug(`Number of connected client: ${sockets.size}`);
    this.logger.debug(this.io.sockets.adapter.sids);
    this.logger.debug(this.io.sockets.adapter.rooms);
  }

  @SubscribeMessage('ping')
  public ping(client: Socket, data: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Message body: ${data}`);
    return { event: 'pong', message: 'websocket response' };
  }

  public emitToUser(userId: string, event: string, data: object) {
    this.io.to(userId).emit(event, data);
  }
}
