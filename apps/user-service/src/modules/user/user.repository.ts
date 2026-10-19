import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/infra/prisma/prisma.service';
import { RegisterRequest } from '../auth/dto/requests';
import { Prisma, User } from '../../../prisma/generated/client';
import { UserWhereInput } from '../../../prisma/generated/models/User';
import { FindAllRequest } from './dto/requests/find-all.request.dto';
import { FindPopular } from './dto/requests/find-popular.request.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(dto: RegisterRequest) {
    const { login, email, password: passwordHash, age, about } = dto;
    const user = await this.prismaService.user.create({
      data: {
        login,
        email,
        passwordHash,
        age,
        about,
      },
    });
    return user;
  }

  public async findOne(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }
  public async findOneByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { email },
    });
  }
  public async findOneByLogin(login: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { login },
    });
  }
  public async findAll(pagination: FindAllRequest): Promise<User[] | null> {
    const { limit, offset, login } = pagination;
    const where: UserWhereInput = {};
    if (login) where.login = { contains: login, mode: 'insensitive' };
    return this.prismaService.user.findMany({
      skip: offset,
      take: limit,
      where,
    });
  }

  public async findPopular(filters: FindPopular) {
    // const { offset, maxAge, minAge, limit } = filters;
    // const where: UserWhereInput = { about: { not: null }, avatars: { group } };
    // if (maxAge && minAge) where.age = { gte: minAge, lte: maxAge };
    // else if (maxAge && !minAge) where.age = { gte: maxAge };
    // else if (!maxAge && minAge) where.age = { lte: minAge };
    // return this.prismaService.user.findMany({
    //   skip: offset,
    //   take: limit,
    //   where,
    // });
    const { minAge, maxAge, offset, limit } = filters;

    const conditions: Prisma.Sql[] = [
      Prisma.sql`u.deleted_at is null`,
      Prisma.sql`a.deleted_at is null`,
    ];
    if (minAge !== undefined) conditions.push(Prisma.sql`u.age >= ${minAge}`);
    if (maxAge !== undefined) conditions.push(Prisma.sql`u.age <= ${maxAge}`);

    const result = await this.prismaService
      .$queryRaw`select u.*, count(a.user_id) ::int as "avatars_count"
                 from users u
                        inner join avatars a on u.id = a.user_id
                 where ${Prisma.join(conditions, ' and ')}
                 group by u.id
                 having count(a.user_id) >= 2
                 order by u.created_at desc
                 limit ${limit}
                 offset ${offset}`;

    return result;
  }

  public async delete(id: string) {
    // расширение превращает delete в мягкое удаление (update deletedAt = now)
    await this.prismaService.user.delete({
      where: { id },
    });
    return { success: true };
  }
  public async incrementBalance(
    tx: Prisma.TransactionClient,
    userId: string,
    amount: number,
  ) {
    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } },
    });
  }

  public async decrementBalance(
    tx: Prisma.TransactionClient,
    userId: string,
    amount: number,
  ) {
    await tx.user.update({
      where: { id: userId, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
  }

  public async cleanBalance() {
    await this.prismaService.user.updateMany({ data: { balance: 0 } });
  }
}
