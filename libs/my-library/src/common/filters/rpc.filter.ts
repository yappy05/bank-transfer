import { BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Response } from 'express';

// Если remote сервис вернул grpc ошибка, то она будет типа
// ServiceError из пакета '@grpc/grpc-js'
// Создали класс через zod с такими же полями, чтобы легче проверять
// Наличие всех полей в обьекте error и его принадлежность к RPC ошибке

export const RpcServiceErrorSchema = z.object({
  code: z.number(),
  details: z.string(),
  metadata: z.instanceof(Metadata),
});

export class RpcServiceErrorClass extends createZodDto(RpcServiceErrorSchema) {}

@Catch()
export class RpcFilter implements ExceptionFilter {
  catch(exception: any): any {
    console.log('ошибка поймали фильтром', exception);
    // console.log('тип', typeof exception);
    // const response = host.switchToHttp().getResponse<Response>();
    if (this.isRpcException(exception)) {
      throw new BadRequestException('!!');
    }
  }

  private isRpcException = (e: unknown) => {
    if (RpcServiceErrorSchema.safeParse(e).success) {
      console.log('это rpc ошибка');
      return true;
    }
    return false;
  };
}
