import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AuthServiceClient,
  VerifyJwtResponse,
} from '@app/my-library/contracts/proto/generate/auth';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  TransferMoney,
  TransferMoneyZodType,
} from './models/transfer-money.model';

@Injectable()
export class NotificationService implements OnModuleInit {
  private authService: AuthServiceClient;
  private logger: Logger;
  constructor(
    @Inject('AUTH_PACKAGE') private readonly client: ClientGrpc,
    @InjectModel('TransferMoney')
    private readonly transferMoneyModel: Model<TransferMoney>,
  ) {
    this.logger = new Logger(NotificationService.name);
  }

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  public async verifyJwt(token: string) {
    try {
      const response: VerifyJwtResponse = await firstValueFrom(
        this.authService.verifyJwt({ token }),
      );
      return response;
    } catch (e) {
      //код ошибки если просроченный jwt
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e?.code === 2) return undefined;
    }
  }

  public async saveTransferMoneyDocument(dto: TransferMoneyZodType) {
    const created = new this.transferMoneyModel(dto);
    await created.save();
    this.logger.log(
      `Документ перевода денег успешно сохранен в Mongoose, id: ${created.id}, `,
    );
  }
}
