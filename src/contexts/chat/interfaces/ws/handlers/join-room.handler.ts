import { JoinRoomMessage } from '../../../../../protocol/messages'
import { RoomNotFoundError } from '../../../domain/room-not-found.error'
import { UserAlreadyInRoomError } from '../../../domain/user-already-in-room.error'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { AuthenticatedWebSocket } from '../../../../../servers/websocket-server'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'
import { HandlerDeps } from '.'

export const handleJoinRoom = async (
  ws: AuthenticatedWebSocket, 
  message: JoinRoomMessage,
  dependencies: HandlerDeps
) => {
  try {
    const parsedPayload = joinRoomPayloadSchema.safeParse(message.data)

    if (!parsedPayload.success) {
      sendServerResponse(ws, WebSocketServerEventEnum.INVALID_SCHEMA, {
        errors: parsedPayload.error,
      })
      return
    }

    const { roomId } = parsedPayload.data

    await dependencies.roomManagerService.joinRoomUseCase({
      roomId,
      userId: ws.auth.userId
    })

    ws.currentRoomId = roomId

    sendServerResponse(ws, WebSocketServerEventEnum.ROOM_JOINED, {
      roomId,
    })

    dependencies.roomBroadcaster.broadcastToRoom({
      roomId,
      excludeWs: ws,
      event: WebSocketServerEventEnum.USER_JOINED_ROOM,
      data: {
        roomId,
        user: {
          id: ws.auth.userId,
          name: ws.auth.name,
        },
      },
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
