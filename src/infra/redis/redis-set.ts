import { RedisWriteOptions, getRedisClient } from './redis-client'
import { assertValidKey, assertValidTTL } from './utils'

export const redisSet = async (
  key: string,
  value: string,
  options?: RedisWriteOptions,
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
  options?: RedisWriteOptions,
): Promise<void> => {
  await redisSet(key, JSON.stringify(value), options)
}

export const redisSetIfNotExists = async (
  key: string,
  value: string,
  options?: RedisWriteOptions,
): Promise<boolean> => {
  assertValidKey(key)

  const ttlInSeconds = options?.ttlInSeconds

  if (ttlInSeconds === undefined) {
    const result = await getRedisClient().set(key, value, { NX: true })
    return result === 'OK'
  }

  assertValidTTL(ttlInSeconds)
  const result = await getRedisClient().set(key, value, {
    NX: true,
    EX: ttlInSeconds,
  })

  return result === 'OK'
}

export const redisSetJsonIfNotExists = async <T>(
  key: string,
  value: T,
  options?: RedisWriteOptions,
): Promise<boolean> => {
  return redisSetIfNotExists(key, JSON.stringify(value), options)
}
