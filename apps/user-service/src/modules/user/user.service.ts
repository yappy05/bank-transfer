import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { RegisterRequestDto } from '../auth/dto/requests';
import { FindOneResponse } from './dto/responses/find-one.response.dto';
import { Prisma, User } from '../../../prisma/generated/client';
import { FindAllRequest } from './dto/requests/find-all.request.dto';
import * as argon2 from 'argon2';
import { FindPopular } from './dto/requests/find-popular.request.dto';
import { RedisService } from '../../common/infra/redis/redis.service';
import { TransferMoney } from './dto/requests/transfer-money.request.dto';
import { PrismaService } from '../../common/infra/prisma/prisma.service';

@Injectable()
export class UserService {
  logger: Logger;
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {
    this.logger = new Logger(UserService.name);
  }
  public async create(dto: RegisterRequestDto) {
    const [isExistEmail, isExistLogin] = await Promise.all([
      this.userRepository.findOneByEmail(dto.email),
      this.userRepository.findOneByLogin(dto.login),
    ]);

    if (isExistEmail || isExistLogin) throw new ConflictException();

    const passwordHash = await argon2.hash(dto.password);
    return this.userRepository.create({ ...dto, password: passwordHash });
  }
  public async findOne(id: string): Promise<FindOneResponse> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException();
    return this.mapPrismaUser(user);
  }
  public async findOneByLogin(login: string): Promise<User> {
    const user = await this.userRepository.findOneByLogin(login);
    if (!user) throw new NotFoundException();
    return user;
  }

  public async findAll(dto: FindAllRequest): Promise<FindOneResponse[]> {
    const users = await this.userRepository.findAll(dto);
    if (!users) throw new NotFoundException();
    if (users.length === 0) return [];
    const normolizeUsers = users.map((user) => this.mapPrismaUser(user));
    return normolizeUsers;
  }

  public async findPopular(dto: FindPopular) {
    return this.userRepository.findPopular(dto);
  }

  public async delete(id: string) {
    return this.userRepository.delete(id);
  }

  public async transfer(dto: TransferMoney, userId: string, login: string) {
    const { targetUserId, amount } = dto;
    try {
      await this.prismaService.$transaction(
        async (tx) => {
          await this.userRepository.decrementBalance(tx, userId, amount);
          await this.userRepository.incrementBalance(tx, targetUserId, amount);
        },
        { isolationLevel: 'RepeatableRead', maxWait: 5000, timeout: 3000 },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          const sender = await this.userRepository.findOne(userId);
          if (!sender) return;
          this.logger.warn(
            `Перевод отклонен: from=${login} to=${targetUserId.slice(0, 6)}... amount=${amount} balance=${sender.balance.toFixed(2)}`,
          );
          throw new ConflictException(
            Number(sender.balance) < amount
              ? `недостаточно денег на балансе. Не хватает: ${amount - Number(sender.balance)}`
              : `Получатель не найден`,
          );
        } else if (error.code === 'P2039') {
          this.logger.warn(
            `Перевод отклонен: from=${login} to=${targetUserId.slice(0, 6)}... amount=${amount} reason=нарушение ограничения - баланс не может быть отрицательным`,
          );
          throw new ConflictException('Сумма должна быть положительной');
        }
      }

      this.logger.error(
        `Перевод не выполнен: from${login}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Не удалсоь выолнить перевод');
    }
    this.logger.log(
      `Перевод выполнен: from=${login} to=${targetUserId.slice(0, 6)}... amount=${amount}`,
    );
    return { success: true };
  }

  private mapPrismaUser(data: User): FindOneResponse {
    const result: FindOneResponse = {
      login: data.login,
      email: data.email,
      age: data.age,
      about: data.about ?? undefined,
      balance: Number(data.balance.toFixed(2)),
    };
    return result;
  }
}
