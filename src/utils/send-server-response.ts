import { WebSocket } from 'ws'
import { WebSocketServerEventEnum } from '../protocol/server-events'

export const sendServerResponse = (
  ws: WebSocket,
  event: WebSocketServerEventEnum,
  data: Record<string, unknown>
) => {
  ws.send(
    JSON.stringify({
      event,
      data,
    })
  )
}
