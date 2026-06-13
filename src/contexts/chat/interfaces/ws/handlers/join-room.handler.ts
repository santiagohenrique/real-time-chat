import { JoinRoomMessage } from '../../../../../protocol/messages'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { AuthenticatedWebSocket } from '../../../../../servers/websocket-server'
import { roomManagerService } from '.'

export const handleJoinRoom = async (ws: AuthenticatedWebSocket, message: JoinRoomMessage) => {
  try {
    const parsedPayload = joinRoomPayloadSchema.safeParse(message.data)

    if (!parsedPayload.success) {
      sendServerResponse(ws, WebSocketServerEventEnum.INVALID_SCHEMA, {
        errors: parsedPayload.error,
      })
      return
    }

    await roomManagerService.joinRoomUseCase({
      roomName: message.data.roomName,
      userId: ws.auth.userId
    })

    sendServerResponse(ws, WebSocketServerEventEnum.USER_JOINED_ROOM, {
      roomName: message.data.roomName,
    })
  } catch (error) {
    console.error('Error handling join room:', error)
  }
}
