import { z } from 'zod';

/**
 * Creates a cached, type-safe environment variable validator from a Zod schema.
 *
 * @example
 * ```ts
 * import { createEnvValidator, z } from '@madfam/env';
 *
 * const schema = z.object({
 *   DATABASE_URL: z.string().url(),
 *   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
 * });
 *
 * export const { getEnv, getEnvUnsafe, resetCache } = createEnvValidator(schema);
 * ```
 */
export function createEnvValidator<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
) {
  type Env = z.infer<typeof schema>;
  let cached: Env | null = null;

  function getEnv(): Env {
    if (cached) return cached;
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const formatted = parsed.error.flatten().fieldErrors;
      const message = Object.entries(formatted)
        .map(
          ([key, errors]) =>
            `  ${key}: ${(errors as string[])?.join(', ')}`,
        )
        .join('\n');
      throw new Error(`Invalid environment variables:\n${message}`);
    }
    cached = parsed.data;
    return cached;
  }

  function getEnvUnsafe(): Partial<Env> {
    return schema.partial().parse(process.env);
  }

  function resetCache(): void {
    cached = null;
  }

  return { getEnv, getEnvUnsafe, resetCache };
}

/**
 * Production guard for use in `.superRefine()` callbacks.
 * Checks that certain env vars do not hold blocked values when NODE_ENV is 'production'.
 *
 * @example
 * ```ts
 * const schema = baseSchema.superRefine((data, ctx) => {
 *   productionGuard(data, ctx, [
 *     { field: 'AUTH_BYPASS', blockedValue: 'true', message: 'AUTH_BYPASS cannot be enabled in production' },
 *   ]);
 * });
 * ```
 */
export function productionGuard(
  data: Record<string, unknown>,
  ctx: z.RefinementCtx,
  rules: Array<{ field: string; blockedValue: string; message: string }>,
): void {
  if (data.NODE_ENV !== 'production') return;
  for (const rule of rules) {
    if (data[rule.field] === rule.blockedValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: rule.message,
        path: [rule.field],
      });
    }
  }
}

export { z } from 'zod';
