export const assertValidKey = (key: string) => {
  if (key.trim() === '') {
    throw new Error('[redis] Key cannot be empty')
  }
}

export const assertValidTTL = (ttlInSeconds: number) => {
  if (!Number.isInteger(ttlInSeconds) || ttlInSeconds <= 0) {
    throw new Error('[redis] ttlInSeconds must be a positive integer')
  }
}
