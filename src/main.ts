import 'dotenv/config'
import { connectRedis } from './infra/redis/redis-client'
import { server } from './servers/http-server'
import { registerWebSocketServer } from './servers/websocket-server'
import { env } from './configs/environment'
import { RedisKeyValueStore } from './infra/redis/redis-key-value.store'
import { RedisWsTicketStore } from './contexts/auth/infra/persistence/redis-ws-ticket.store'

const keyValueStore = new RedisKeyValueStore()
const wsTicketStore = new RedisWsTicketStore(keyValueStore)

const bootstrap = async () => {
  try {
    await connectRedis()
    registerWebSocketServer(
      server,
      wsTicketStore,
    )

    server.listen(env.PORT, () => {
      console.log(`Servidor rodando na porta ${env.PORT}`)
    })
  } catch (error) {
    console.error('[app] Failed to start server:', error)
    process.exit(1)
  }
}

void bootstrap()
