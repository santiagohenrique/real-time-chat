import { WebSocket } from 'ws'
import { JoinRoomMessage } from '../../../../../protocol/messages'
import { WebSocketServerEventEnum } from '../../../../../protocol/server-events'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'
import { sendServerResponse } from '../../../../../utils/send-server-response'

export const handleJoinRoom = (ws: WebSocket, message: JoinRoomMessage) => {
  const parsedPayload = joinRoomPayloadSchema.safeParse(message.data)

  if (!parsedPayload.success) {
    ws.send(
      JSON.stringify({
        type: WebSocketServerEventEnum.INVALID_SCHEMA,
        data: {
          message: parsedPayload.error.issues[0]?.message ?? 'Invalid schema',
        },
      })
    )
    return
  }

  sendServerResponse(ws, WebSocketServerEventEnum.USER_JOINED_ROOM, {
    roomName: message.data.roomName,
  })
}
