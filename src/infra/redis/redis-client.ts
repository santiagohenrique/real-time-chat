import { createClient } from 'redis'

type RedisConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'error'

type RedisClient = ReturnType<typeof createClient>

export type RedisWriteOptions = {
  ttlInSeconds?: number
}

let client: RedisClient | null = null
let status: RedisConnectionStatus = 'idle'
let connectPromise: Promise<RedisClient> | null = null

const parseIntegerEnv = (
  value: string | undefined,
  fallback: number,
  envName: string
): number => {
  if (!value || value.trim() === '') {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    throw new Error(`[redis] Invalid ${envName}: ${value}`)
  }

  return parsed
}

const createRedisClient = (): RedisClient => {
  const host = process.env.REDIS_HOST?.trim() || '127.0.0.1'
  const port = parseIntegerEnv(process.env.REDIS_PORT, 6379, 'REDIS_PORT')
  const database = parseIntegerEnv(process.env.REDIS_DB, 0, 'REDIS_DB')
  const connectTimeout = parseIntegerEnv(
    process.env.REDIS_CONNECT_TIMEOUT_MS,
    5000,
    'REDIS_CONNECT_TIMEOUT_MS'
  )

  const options: Parameters<typeof createClient>[0] = {
    socket: {
      host,
      port,
      connectTimeout,
    },
    database,
  }

  const password = process.env.REDIS_PASSWORD?.trim()

  if (password) {
    options.password = password
  }

  const redisClient = createClient(options)

  redisClient.on('connect', () => {
    status = 'connecting'
    console.log('[redis] Connecting...')
  })

  redisClient.on('ready', () => {
    status = 'connected'
    console.log('[redis] Connection ready')
  })

  redisClient.on('reconnecting', () => {
    status = 'reconnecting'
    console.warn('[redis] Reconnecting...')
  })

  redisClient.on('end', () => {
    status = 'ended'
    console.warn('[redis] Connection closed')
  })

  redisClient.on('error', (error) => {
    status = 'error'
    console.error('[redis] Client error:', error)
  })

  return redisClient
}

export const connectRedis = async (): Promise<RedisClient> => {
  if (client?.isReady) {
    return client
  }

  if (!client) {
    client = createRedisClient()
  }

  if (connectPromise) {
    return connectPromise
  }

  status = 'connecting'

  connectPromise = client
    .connect()
    .then(() => {
      if (!client) {
        throw new Error('[redis] Client is not initialized')
      }
      return client
    })
    .finally(() => {
      connectPromise = null
    })

  return connectPromise
}

export const disconnectRedis = async (): Promise<void> => {
  if (!client || !client.isOpen) {
    return
  }

  try {
    await client.quit()
  } catch (error) {
    console.error(
      '[redis] Failed graceful shutdown, forcing disconnect:',
      error
    )
    client.disconnect()
  }
}

export const getRedisClient = (): RedisClient => {
  if (!client?.isReady) {
    throw new Error('[redis] Client is not connected')
  }

  return client
}

export const getRedisConnectionStatus = (): RedisConnectionStatus => status

