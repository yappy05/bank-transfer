import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const JwtResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export class JwtResponseDto extends createZodDto(JwtResponseSchema) {}
export type JwtResponse = z.infer<typeof JwtResponseSchema>;

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  login: z.string(),
});
export class JwtPayloadDto extends createZodDto(JwtPayloadSchema) {}
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
