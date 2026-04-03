import { assertValidKey, getRedisClient } from './redis-client'

export const redisGet = async (key: string): Promise<string | null> => {
  assertValidKey(key)
  return getRedisClient().get(key)
}

export const redisGetJson = async <T>(key: string): Promise<T | null> => {
  const value = await redisGet(key)

  if (value === null) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch (error) {
    throw new Error(`[redis] Value for key ${key} is not valid JSON`, {
      cause: error,
    })
  }
}
