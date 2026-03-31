import { server } from './http-server'
import { registerWebSocketServer } from './websocket-server'

const PORT = 3002

registerWebSocketServer(server)

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
