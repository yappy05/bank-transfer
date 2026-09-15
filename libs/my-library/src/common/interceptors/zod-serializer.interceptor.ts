import { createZodSerializerInterceptor } from 'nestjs-zod';

export const CustomZodSerializerInterceptor = createZodSerializerInterceptor({
  reportInput: true,
});
