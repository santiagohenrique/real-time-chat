import type { AuthenticatedWebSocket } from '../../../../../servers/websocket-server'
import { WebSocket, WebSocketServer } from 'ws'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { sendServerResponse } from '../../../../../utils/send-server-response'

export type BroadcastToRoomInput = {
  roomId: string
  event: WebSocketServerEventEnum
  data: Record<string, unknown>
  excludeWs?: AuthenticatedWebSocket
}

export type RoomBroadcaster = {
  broadcastToRoom(input: BroadcastToRoomInput): void
}

export const createRoomBroadcaster = (
  wss: WebSocketServer,
): RoomBroadcaster => ({
  broadcastToRoom(input) {
    wss.clients.forEach((client) => {
      const roomClient = client as AuthenticatedWebSocket

      if (roomClient.readyState !== WebSocket.OPEN) {
        return
      }

      if (roomClient.currentRoomId !== input.roomId) {
        return
      }

      if (input.excludeWs && roomClient === input.excludeWs) {
        return
      }

      sendServerResponse(roomClient, input.event, input.data)
    })
  },
})
