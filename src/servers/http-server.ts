import express from 'express'
import { createServer } from 'http'
import { getRedisConnectionStatus } from '../infra/redis/redis-client'

const app = express()

app.use(express.json())

app.get('/redis/health', (req, response) => {
  const redisStatus = getRedisConnectionStatus()
  const isHealthy = redisStatus === 'connected'

  response.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    redis: redisStatus,
  })
})

export const server = createServer(app)
