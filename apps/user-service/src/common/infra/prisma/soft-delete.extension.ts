import { PrismaClient } from '../../../../prisma/generated/client';

type HookArgs = {
  where?: Record<string, unknown>;
  [key: string]: unknown;
};

type HookParams = {
  model: string;
  operation: string;
  args: HookArgs;
  query: (args: HookArgs) => Promise<unknown>;
};

type SoftDeleteDelegate = {
  update(args: { where: unknown; data: { deletedAt: Date } }): Promise<unknown>;
  updateMany(args: {
    where: unknown;
    data: { deletedAt: Date };
  }): Promise<unknown>;
};

/**
 * Мягкое удаление для моделей из реестра (по умолчанию поле deletedAt).
 *
 * Семантика:
 *  - delete / deleteMany        -> мягкое удаление (update deletedAt = now);
 *    deleteMany трогает только активные строки (where дополняется deletedAt: null);
 *  - find* / count / aggregate / groupBy -> в where автоматически добавляется
 *    deletedAt: null; чтобы явно выбрать удалённых, передай своё условие по полю,
 *    например where: { deletedAt: { not: null } } (опт-ин);
 *  - updateMany                 -> защита: обновляет только активные строки
 *    (where дополняется deletedAt: null), если не задан явный фильтр по полю;
 *  - update                     -> проходит без изменений (точечное обновление по id —
 *    явное намерение), при необходимости укажи deletedAt в where сам.
 *
 * base — НЕрасширенный клиент: вызовы внутри хуков идут через него, без рекурсии.
 */
export function softDeleteExtension(
  base: PrismaClient,
  models: string[] = ['User'],
) {
  const softModels = new Set(models);

  const readOps = new Set([
    'findUnique',
    'findUniqueOrThrow',
    'findFirst',
    'findFirstOrThrow',
    'findMany',
    'count',
    'aggregate',
    'groupBy',
  ]);

  return {
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: HookParams) {
          if (!softModels.has(model)) return query(args);

          const delegate = (
            base as unknown as Record<string, SoftDeleteDelegate>
          )[model[0].toLowerCase() + model.slice(1)];
          const whereHasField = args?.where?.deletedAt !== undefined;

          // мягкое удаление одной записи
          if (operation === 'delete') {
            return delegate.update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }

          // мягкое удаление пачкой: только активные строки
          if (operation === 'deleteMany') {
            return delegate.updateMany({
              where: { ...(args.where || {}), deletedAt: null },
              data: { deletedAt: new Date() },
            });
          }

          // чтения: невидимы удалённые, если не задан явный фильтр по deletedAt
          if (readOps.has(operation)) {
            if (whereHasField) return query(args);
            args.where = { ...(args.where || {}), deletedAt: null };
            return query(args);
          }

          // массовое обновление не должно задевать удалённые строки
          if (operation === 'updateMany') {
            if (whereHasField) return query(args);
            args.where = { ...(args.where || {}), deletedAt: null };
            return query(args);
          }

          return query(args);
        },
      },
    },
  };
}
