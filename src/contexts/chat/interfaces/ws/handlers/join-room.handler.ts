import { JoinRoomMessage } from '../../../../../protocol/messages'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { AuthenticatedWebSocket } from '../../../../../servers/websocket-server'
import { roomManagerService } from '.'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'

export const handleJoinRoom = async (ws: AuthenticatedWebSocket, message: JoinRoomMessage) => {
  try {
    const parsedPayload = joinRoomPayloadSchema.safeParse(message.data)
    const { roomId } = message?.data

    if (!parsedPayload.success) {
      sendServerResponse(ws, WebSocketServerEventEnum.INVALID_SCHEMA, {
        errors: parsedPayload.error,
      })
      return
    }

    await roomManagerService.joinRoomUseCase({
      roomId,
      userId: ws.auth.userId
    })

    sendServerResponse(ws, WebSocketServerEventEnum.USER_JOINED_ROOM, {
      roomId: message.data.roomId,
    })
  } catch (error) {
    console.error('Error handling join room:', error)
  }
}
