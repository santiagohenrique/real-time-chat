import dotenv from 'dotenv'
import { connectRedis } from './infra/redis/redis-client'
import { server } from './servers/http-server'
import { registerWebSocketServer } from './servers/websocket-server'

dotenv.config()

const PORT = process.env.PORT || 3000

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
