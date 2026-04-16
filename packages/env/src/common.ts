import { z } from 'zod';

/** PostgreSQL connection URL. Must start with `postgres`. */
export const databaseUrlSchema = z.string().url().startsWith('postgres');

/** Redis connection URL. Must start with `redis`. */
export const redisUrlSchema = z.string().url().startsWith('redis');

/** Janua OIDC credentials required for Auth.js integration. */
export const januaOidcSchema = z.object({
  AUTH_JANUA_ISSUER: z.string().url(),
  AUTH_JANUA_CLIENT_ID: z.string().min(1),
  AUTH_JANUA_CLIENT_SECRET: z.string().min(1),
});

/** Optional Sentry DSN for error tracking. */
export const sentryDsnSchema = z.string().url().optional();

/** Standard NODE_ENV with development default. */
export const nodeEnvSchema = z
  .enum(['development', 'production', 'test'])
  .default('development');
