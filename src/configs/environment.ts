import 'dotenv/config'
import z from 'zod'

const trimEnvValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  return value.trim()
}

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmedValue = value.trim()

  if (trimmedValue === '') {
    return undefined
  }

  return trimmedValue
}

const environmentSchema = z.object({
  NODE_ENV: z.preprocess(
    emptyStringToUndefined,
    z.enum(['development', 'test', 'production']).default('development'),
  ),

  PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().default(3000),
  ),

  JWT_SECRET_KEY: z.preprocess(
    trimEnvValue,
    z.string().min(1, 'JWT_SECRET_KEY is required'),
  ),
  JWT_ISSUER: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).default('real-time-chat'),
  ),
  JWT_AUDIENCE: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).default('real-time-chat-client'),
  ),

  REDIS_HOST: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).default('127.0.0.1'),
  ),
  REDIS_PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().default(6379),
  ),
  REDIS_DB: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(0).default(0),
  ),
  REDIS_PASSWORD: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).optional(),
  ),
  REDIS_CONNECT_TIMEOUT_MS: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().default(5000),
  ),
})

export const parseEnvironment = (rawEnv: NodeJS.ProcessEnv) => {
  const result = environmentSchema.safeParse(rawEnv)

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.join('.')
      return `${path}: ${issue.message}`
    })

    throw new Error(
      `Invalid environment variables:\n- ${errors.join('\n- ')}`
    )
  }

  return Object.freeze(result.data)
}

export const env = parseEnvironment(process.env)
