import { Server } from 'http'
import { parseMessage } from './protocol/parser'
import { handlers } from './app/handlers'
import { RawData, WebSocket, WebSocketServer } from 'ws'

export const registerWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    clientTracking: true,
  })

  wss.on('connection', function connection(ws, request) {
    ws.on('message', function message(data: RawData) {
      dispatchMessage(ws, data)
    })

    ws.on('close', function close() {
      console.log('Client disconnected')
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
