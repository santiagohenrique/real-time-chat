import { Server } from 'http'
import { parseMessage } from '../protocol/parser'
import { RawData, WebSocket } from 'ws'
import { createHandlers } from '../contexts/chat/interfaces/ws/handlers'
import { ZodError } from 'zod'
import { WebSocketServerEventEnum } from '../protocol/enums/server-events.enum'
import { Duplex } from 'stream'
import { WsTicketStore } from '../contexts/auth/application/ports/ws-ticket.store'
import { UserNotInRoomError } from '../contexts/chat/domain/user-not-in-room.error'
import { RoomManagerService } from '../contexts/chat/domain/services/room-manager.service'
import { RedisRoomStore } from '../contexts/chat/infra/persistence/redis-room.store'
import { createRoomBroadcaster } from '../contexts/chat/interfaces/ws/broadcasters/room-broadcaster'
import { WebSocketServer } from 'ws'

export type WebSocketAuth = {
  userId: string
  name: string
}

export type AuthenticatedWebSocket = WebSocket & {
  auth: WebSocketAuth
  currentRoomId: string | null
}

export const registerWebSocketServer = (
  server: Server,
  wsTicketStore: WsTicketStore,
) => {
  const wss = new WebSocketServer({
    noServer: true,
    clientTracking: true,
  })
  const roomStore = new RedisRoomStore()
  const roomManagerService = new RoomManagerService(roomStore)
  const roomBroadcaster = createRoomBroadcaster(wss)
  const handlers = createHandlers({
    roomManagerService,
    roomBroadcaster,
  })
  const activeConnections = new Map<string, AuthenticatedWebSocket>()

  const replaceActiveConnection = (ws: AuthenticatedWebSocket) => {
    const userId = ws.auth.userId
    const previousConnection = activeConnections.get(userId)

    if (previousConnection && previousConnection !== ws) {
      ws.currentRoomId = previousConnection.currentRoomId
      previousConnection.currentRoomId = null
    }

    activeConnections.set(userId, ws)

    if (previousConnection && previousConnection !== ws) {
      previousConnection.close(4000, 'Replaced by a newer connection')
    }
  }

  const unregisterActiveConnection = (ws: AuthenticatedWebSocket) => {
    const currentConnection = activeConnections.get(ws.auth.userId)

    if (currentConnection !== ws) {
      return false
    }

    activeConnections.delete(ws.auth.userId)
    return true
  }

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

      const hydratedCurrentRoomId = await roomStore.getCurrentRoomId(
        session.userId,
      )

      wss.handleUpgrade(request, socket, head, function(rawWs) {
        const ws = rawWs as AuthenticatedWebSocket
        
        ws.auth = {
          userId: session.userId,
          name: session.name,
        }

        ws.currentRoomId = hydratedCurrentRoomId
  
        wss.emit('connection', ws, request)
      })
    } catch(error) {
      console.error('error upgrading http server to ws', error)
      rejectUpgrade(socket)
    }

  })

  wss.on('connection', function connection(rawWs) {
    const ws = rawWs as AuthenticatedWebSocket
    replaceActiveConnection(ws)
    
    console.log('New client connected!')
    console.log(`Total clients connected: ${wss.clients.size}`)

    ws.on('message', async function message(data: RawData) {
      try {
        await dispatchMessage(ws, data, handlers)
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

    ws.on('close', async () => {
      if (!unregisterActiveConnection(ws)) {
        return
      }

      try {
        const result = await roomManagerService.leaveRoomUseCase(ws.auth.userId)
        const { roomId } = result
        ws.currentRoomId = null

        roomBroadcaster.broadcastToRoom({
          roomId,
          excludeWs: ws,
          event: WebSocketServerEventEnum.USER_LEFT_ROOM,
          data: {
            roomId,
            user: {
              id: ws.auth.userId,
              name: ws.auth.name,
            },
          },
        })
      } catch (error) {
        if (error instanceof UserNotInRoomError) {
          return
        }

        console.error('Error handling socket close:', error)
      }
    })
  })

  return wss
}

export const dispatchMessage = async (
  ws: AuthenticatedWebSocket,
  data: RawData,
  handlers: ReturnType<typeof createHandlers>,
) => {
  const result = parseMessage(data)

  if (result.status === false || result.message === null) {
    console.warn('Received invalid message:', data)
    return
  }

  const handler = handlers[result.message.type]
  await handler(ws, result.message)
}

function rejectUpgrade(socket: Duplex) {
  socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
  socket.destroy();
}
