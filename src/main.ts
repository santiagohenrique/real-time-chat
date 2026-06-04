import 'dotenv/config'
import { connectRedis } from './infra/redis/redis-client'
import { server } from './servers/http-server'
import { registerWebSocketServer } from './servers/websocket-server'
import { env } from './configs/environment'

const bootstrap = async () => {
  try {
    await connectRedis()
    registerWebSocketServer(server)

    server.listen(env.PORT, () => {
      console.log(`Servidor rodando na porta ${env.PORT}`)
    })
  } catch (error) {
    console.error('[app] Failed to start server:', error)
    process.exit(1)
  }
}

void bootstrap()
