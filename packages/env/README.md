# @madfam/env

Zod-validated environment loading for MADFAM services, plus the shared schemas the
ecosystem contracts rely on. Version 0.1.0 (not yet published; see the root
[`README.md`](../../README.md) §VIII).

> **Boundary checkpoint** (2026-09-23): this README documents variable *names* only.
> Real values — above all `AUTH_JANUA_CLIENT_SECRET` — come from Vault through External
> Secrets in production and never appear in a repo. Policy:
> [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md).

## Use

```ts
import { createEnvValidator, z } from '@madfam/env';
import { januaOidcSchema, databaseUrlSchema, nodeEnvSchema } from '@madfam/env/common';

const schema = januaOidcSchema.extend({
  DATABASE_URL: databaseUrlSchema,
  NODE_ENV: nodeEnvSchema,
});

export const { getEnv } = createEnvValidator(schema);
```

`getEnv()` throws with every invalid variable listed, so a misconfigured service fails at
boot instead of at the first request.

## The Janua env contract (schema of record)

*Owner ruling, 2026-09-23.* `januaOidcSchema` **is** the ecosystem's one Janua env contract:

| Variable | Meaning | Secret? |
|---|---|---|
| `AUTH_JANUA_ISSUER` | full issuer URL (`https://auth.madfam.io` in production) | no |
| `AUTH_JANUA_CLIENT_ID` | the client ID Janua issued at registration | no |
| `AUTH_JANUA_CLIENT_SECRET` | confidential clients only | **yes** — server-only |

MADFAM Next.js apps feed these into `@madfam/janua-next`; the Auth.js `janua` provider is the
documented alternative. The JWKS URL and the expected audience are derived, not configured.
Full guide: [`docs/JANUA_INTEGRATION.md`](../../docs/JANUA_INTEGRATION.md). No Janua value
belongs in a `NEXT_PUBLIC_*` variable.

## Other exports

| Export | Purpose |
|---|---|
| `createEnvValidator(schema)` | cached, typed validator (`getEnv`, `getEnvUnsafe`, `resetCache`) |
| `productionGuard(...)` | refuses development-only values in production |
| `databaseUrlSchema`, `redisUrlSchema`, `sentryDsnSchema`, `nodeEnvSchema` | shared field schemas (`@madfam/env/common`) |
| `z` | re-exported Zod, so consumers pin one version |
