import { Server } from 'http'
import { parseMessage } from '../protocol/parser'
import { RawData, WebSocket, WebSocketServer } from 'ws'
import { handlers } from '../contexts/chat/interfaces/ws/handlers'
import { ZodError } from 'zod'
import { WebSocketServerEventEnum } from '../protocol/server-events.enum'

export const registerWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    clientTracking: true,
  })

  wss.on('connection', function connection(ws, request) {
    console.log('New client connected!')
    console.log(`Total clients connected: ${wss.clients.size}`)

    ws.on('message', function message(data: RawData) {
      try {
        dispatchMessage(ws, data)
      } catch (error) {
        console.error('Error processing message:', error)
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

export const dispatchMessage = (ws: WebSocket, data: RawData) => {
  const result = parseMessage(data)

  if (result.status === false || result.message === null) {
    console.warn('Received invalid message:', data)
    return
  }

  const handler = handlers[result.message.type]

  handler(ws, result.message)
}
