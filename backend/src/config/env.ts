import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment schema validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.string().transform(Number).default('20'),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_TLS: z.string().transform((val) => val === 'true').default('false'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // AWS / R2
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_REGION: z.string().default('auto'),
  AWS_ENDPOINT: z.string().url(),
  CDN_URL: z.string().url().optional(),

  // Claude AI
  CLAUDE_API_KEY: z.string().startsWith('sk-ant-'),
  CLAUDE_MODEL_FAST: z.string().default('claude-3-5-haiku-20241022'),
  CLAUDE_MODEL_QUALITY: z.string().default('claude-3-5-sonnet-20241022'),
  CLAUDE_MAX_TOKENS: z.string().transform(Number).default('4096'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  AUTH_RATE_LIMIT_MAX: z.string().transform(Number).default('5'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  MAX_FILES_PER_UPLOAD: z.string().transform(Number).default('20'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),

  // Image Processing
  IMAGE_QUALITY: z.string().transform(Number).default('85'),
  THUMBNAIL_SIZE: z.string().transform(Number).default('200'),
  MEDIUM_SIZE: z.string().transform(Number).default('800'),
  FULL_SIZE: z.string().transform(Number).default('1920'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),

  // Monitoring (Optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

// Export typed environment
export type Env = z.infer<typeof envSchema>;
