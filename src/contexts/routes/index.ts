import { Express, Router } from 'express'
import { authRoutes } from '../auth/interfaces/http/routes/auth.routes'
import { getRedisConnectionStatus } from '../../infra/redis/redis-client'

export const registerContextRoutes = (app: Express): void => {
  const apiRoutes = Router()

  apiRoutes.use('/auth', authRoutes)
  apiRoutes.get('/redis/health', (req, response) => {
    const redisStatus = getRedisConnectionStatus()
    const isHealthy = redisStatus === 'connected'

    response.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      redis: redisStatus,
    })
  })

  app.use('/api', apiRoutes)
}
