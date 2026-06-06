import { KeyValueStore } from "../key-value.store";
import { getRedisClient } from "./redis-client";
import { assertValidKey, assertValidTTL } from "./utils";

export class RedisKeyValueStore implements KeyValueStore {
  constructor() {}

  get(key: string): Promise<string | null> {
    assertValidKey(key)
    return getRedisClient().get(key)
  }

  async getDel(key: string): Promise<string | null> {
    assertValidKey(key)
    const value = await getRedisClient().getDel(key)
    
    return value
  }

  async set(
    key: string, 
    value: string, 
    options?: { 
      ttlInSeconds?: number; 
    }
  ): Promise<boolean> {
    assertValidKey(key)
    
    const ttlInSeconds = options?.ttlInSeconds
  
    if (ttlInSeconds === undefined) {
      await getRedisClient().set(key, value)
      return false
    }
  
    assertValidTTL(ttlInSeconds)
    const result = await getRedisClient().set(key, value, { EX: ttlInSeconds })
    return result === 'OK'
  }

  async setIfNotExists(
    key: string, 
    value: string, 
    options?: { 
      ttlInSeconds?: number; 
    }
  ): Promise<boolean> {
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


}