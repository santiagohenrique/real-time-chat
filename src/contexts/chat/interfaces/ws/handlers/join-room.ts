import { WebSocket } from 'ws'
import { JoinRoomMessage } from '../../../../../protocol/messages'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/join-room'
import { WebSocketServerEventEnum } from '../../../../../protocol/server-events'

export const handleJoinRoom = (ws: WebSocket, message: JoinRoomMessage) => {
  const parsedPayload = joinRoomPayloadSchema.safeParse(message.payload)

  if (!parsedPayload.success) {
    ws.send(
      JSON.stringify({
        type: WebSocketServerEventEnum.INVALID_PAYLOAD,
        payload: {
          message: parsedPayload.error.issues[0]?.message ?? 'Payload inválido',
        },
      })
    )
    return
  }

  ws.send(
    JSON.stringify({
      type: WebSocketServerEventEnum.ROOM_JOINED,
      payload: {
        roomName: message.payload.roomName,
      },
    })
  )
}
