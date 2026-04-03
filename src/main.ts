import dotenv from 'dotenv'
import { connectRedis, disconnectRedis } from './infra/redis/redis-client'
import { server } from './servers/http-server'
import { registerWebSocketServer } from './servers/websocket-server'

dotenv.config()

const PORT = process.env.PORT || 3000
let isShuttingDown = false

const gracefulShutdown = async (signal: NodeJS.Signals) => {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true

  console.log(`[app] Received ${signal}. Shutting down...`)

  try {
    await disconnectRedis()
  } catch (error) {
    console.error('[app] Error closing Redis connection:', error)
  }

  if (!server.listening) {
    process.exit(0)
    return
  }

  server.close((error) => {
    if (error) {
      console.error('[app] Error closing HTTP server:', error)
      process.exit(1)
      return
    }

    console.log('[app] HTTP server closed')
    process.exit(0)
  })
}

process.once('SIGINT', () => {
  void gracefulShutdown('SIGINT')
})

process.once('SIGTERM', () => {
  void gracefulShutdown('SIGTERM')
})

const bootstrap = async () => {
  try {
    await connectRedis()
    registerWebSocketServer(server)

    server.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })
  } catch (error) {
    console.error('[app] Failed to start server:', error)
    process.exit(1)
  }
}

void bootstrap()
