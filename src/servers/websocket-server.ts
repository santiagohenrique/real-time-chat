import { Server } from 'http'
import { parseMessage } from '../protocol/parser'
import { RawData, WebSocket, WebSocketServer } from 'ws'
import { handlers } from '../contexts/chat/interfaces/ws/handlers'
import { ZodError } from 'zod'
import { WebSocketServerEventEnum } from '../protocol/enums/server-events.enum'
import { Duplex } from 'stream'
import { WsTicketStore } from '../contexts/auth/ws-ticket.store'

export type WebSocketAuth = {
  userId: string
  name: string
}

export type AuthenticatedWebSocket = WebSocket & {
  auth: WebSocketAuth
}

export const registerWebSocketServer = (
  server: Server,
  wsTicketStore: WsTicketStore,
) => {

  const wss = new WebSocketServer({
    noServer: true,
    clientTracking: true,
  })

  server.on('upgrade', async function(request, socket, head) {
    const searchParams = new URL(
      request.url ?? '/',
      `http://${request.headers.host ?? 'localhost'}`
    ).searchParams

    const authTicket = searchParams.get('ticket')?.trim()

    if(!authTicket) {
      rejectUpgrade(socket)
      return
    }

    try {
      const session: WebSocketAuth | null = await wsTicketStore.consume(authTicket)

      if(!session) {
        rejectUpgrade(socket)
        return
      }

      wss.handleUpgrade(request, socket, head, function(rawWs) {
        const ws = rawWs as AuthenticatedWebSocket
        ws.auth = {
          userId: session.userId,
          name: session.name,
        }
  
        wss.emit('connection', ws, request)
      })
    } catch(error) {
      console.error('error upgrading http server to ws', error)
      rejectUpgrade(socket)
    }

  })

  wss.on('connection', function connection(rawWs) {
    console.log('New client connected!')
    console.log(`Total clients connected: ${wss.clients.size}`)

    const ws = rawWs as AuthenticatedWebSocket

    ws.on('message', function message(data: RawData) {
      try {
        dispatchMessage(ws, data)
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error processing message', error.stack)
        } else {
          console.error('Error processing message', error)
        }
        if (error instanceof ZodError) {
          ws.send(
            JSON.stringify({
              event: WebSocketServerEventEnum.INVALID_SCHEMA,
              data: {
                message: error.issues[0]?.message ?? 'Invalid schema',
              },
            })
          )
        }
        if (error instanceof SyntaxError) {
          ws.send(
            JSON.stringify({
              event: WebSocketServerEventEnum.INVALID_PAYLOAD,
              data: {
                message: 'Syntax error in payload',
              },
            })
          )
        }
      }
    })

    ws.on('close', function close() {
      console.log('Client disconnected')
      console.log(`Total clients connected: ${wss.clients.size}`)
    })
  })

  return wss
}

export const dispatchMessage = (ws: AuthenticatedWebSocket, data: RawData) => {
  const result = parseMessage(data)

  if (result.status === false || result.message === null) {
    console.warn('Received invalid message:', data)
    return
  }

  const handler = handlers[result.message.type]

  handler(ws, result.message)
}

function rejectUpgrade(socket: Duplex) {
  socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
  socket.destroy();
}