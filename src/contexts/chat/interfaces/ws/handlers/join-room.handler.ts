import { JoinRoomMessage } from '../../../../../protocol/messages'
import { RoomNotFoundError } from '../../../domain/room-not-found.error'
import { UserAlreadyInRoomError } from '../../../domain/user-already-in-room.error'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { AuthenticatedWebSocket } from '../../../../../servers/websocket-server'
import { roomManagerService } from '.'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'

export const handleJoinRoom = async (ws: AuthenticatedWebSocket, message: JoinRoomMessage) => {
  try {
    const parsedPayload = joinRoomPayloadSchema.safeParse(message.data)

    if (!parsedPayload.success) {
      sendServerResponse(ws, WebSocketServerEventEnum.INVALID_SCHEMA, {
        errors: parsedPayload.error,
      })
      return
    }

    const { roomId } = parsedPayload.data

    await roomManagerService.joinRoomUseCase({
      roomId,
      userId: ws.auth.userId
    })

    sendServerResponse(ws, WebSocketServerEventEnum.USER_JOINED_ROOM, {
      roomId,
    })
  } catch (error) {
    if (error instanceof RoomNotFoundError) {
      sendServerResponse(ws, WebSocketServerEventEnum.ROOM_NOT_FOUND, {
        message: error.message,
      })
      return
    }

    if (error instanceof UserAlreadyInRoomError) {
      sendServerResponse(ws, WebSocketServerEventEnum.USER_ALREADY_IN_ROOM, {
        message: error.message,
      })
      return
    }

    console.error('Error handling join room:', error)
  }
}
