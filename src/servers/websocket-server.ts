import { Server } from 'http'
import { parseMessage } from '../protocol/parser'
import { RawData, WebSocket, WebSocketServer } from 'ws'
import { handlers } from '../contexts/chat/interfaces/ws/handlers'

export const registerWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    clientTracking: true,
  })

  wss.on('connection', function connection(ws, request) {
    ws.on('message', function message(data: RawData) {
      try {
        dispatchMessage(ws, data)
      } catch (error) {
        console.error('Error processing message:', error)
      }
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
