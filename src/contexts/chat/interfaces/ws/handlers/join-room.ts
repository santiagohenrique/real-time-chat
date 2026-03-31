import { WebSocket } from 'ws'
import { JoinRoomMessage } from '../../../../../protocol/messages'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/join-room'
import { WebSocketServerEventEnum } from '../../../../../protocol/server-events'

export const handleJoinRoom = (ws: WebSocket, message: JoinRoomMessage) => {
  const parsedPayload = joinRoomPayloadSchema.safeParse(message.data)

  if (!parsedPayload.success) {
    ws.send(
      JSON.stringify({
        event: WebSocketServerEventEnum.INVALID_PAYLOAD,
        data: {
          message: parsedPayload.error.issues[0]?.message ?? 'Payload inválido',
        },
      })
    )
    return
  }

  ws.send(
    JSON.stringify({
      event: WebSocketServerEventEnum.ROOM_JOINED,
      data: {
        roomName: message.data.roomName,
      },
    })
  )
}
