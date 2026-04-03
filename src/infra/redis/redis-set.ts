import {
  RedisWriteOptions,
  assertValidKey,
  getRedisClient,
  assertValidTTL,
} from './redis-client'

export const redisSet = async (
  key: string,
  value: string,
  options?: RedisWriteOptions
): Promise<void> => {
  assertValidKey(key)

  const ttlInSeconds = options?.ttlInSeconds

  if (ttlInSeconds === undefined) {
    await getRedisClient().set(key, value)
    return
  }

  assertValidTTL(ttlInSeconds)
  await getRedisClient().set(key, value, { EX: ttlInSeconds })
}

export const redisSetJson = async <T>(
  key: string,
  value: T,
  options?: RedisWriteOptions
): Promise<void> => {
  await redisSet(key, JSON.stringify(value), options)
}
