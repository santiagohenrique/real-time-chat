import { server } from './servers/http-server'
import { registerWebSocketServer } from './servers/websocket-server'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000

registerWebSocketServer(server)

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
