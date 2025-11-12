import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().default(3000)),
  LOG_LEVEL: z.string().default('info'),
  LOG_ENDPOINT: z.string().url().optional(),
  JWT_SECRET: z.string(),
  // DATABASE_URL is optional for unit tests and local tooling. Production
  // environments should still provide a real DATABASE_URL.
  DATABASE_URL: z.string().url().optional(),
});

export type AppConfig = z.infer<typeof schema>;

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // throw a detailed error to fail fast in CI/production
    throw new Error(`Invalid configuration: ${JSON.stringify(parsed.error.format())}`);
  }
  cachedConfig = parsed.data;
  return cachedConfig;
}

export function isProduction(): boolean {
  return getConfig().NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return getConfig().NODE_ENV === 'development';
}
