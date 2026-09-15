import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  logger: Logger;
  constructor() {
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

  handleConnection(client: Socket) {
    const { sockets } = this.io.sockets;
    const token = client.handshake.headers.authorization;
    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Client auth token: ${token}`);
    this.logger.debug(`Number of connected client: ${sockets.size}`);
  }

  @SubscribeMessage('ping')
  public ping(client: Socket, data: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Message body: ${data}`);
    return { event: 'pong', message: 'websocket response' };
  }
}
