import * as z from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Env vars are always strings, so coerce converts "3000" to the number 3000.
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().refine((value) => /^postgres(ql)?:\/\//.test(value), {
    error: 'must start with postgresql:// or postgres://',
  }),
});

/** The validated, typed shape of the API's configuration. */
export type Env = z.infer<typeof envSchema>;

/** Passed to ConfigModule's `validate` option. Throwing here stops the app from booting. */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  - ${issue.path.map(String).join('.')}: ${issue.message}`,
    );
    throw new Error(`Invalid environment configuration:\n${lines.join('\n')}`);
  }

  return result.data;
}
