export interface KeyValueStore {
  get(key: string): Promise<string | null>
  getDel(key: string): Promise<string | null>
  set(
    key: string,
    value: string,
    options?: { ttlInSeconds?: number },
  ): Promise<boolean>
  setIfNotExists(
    key: string,
    value: string,
    options?: { ttlInSeconds?: number },
  ): Promise<boolean>
}