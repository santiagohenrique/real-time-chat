import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { AuthenticatedWebSocket } from '../../../../../servers/websocket-server'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { RoomNotFoundError } from '../../../domain/room-not-found.error'
import { UserNotInRoomError } from '../../../domain/user-not-in-room.error'
import { roomManagerService } from '.'

export const handleLeaveRoom = async (
  ws: AuthenticatedWebSocket,
) => {
  try {
    const result = await roomManagerService.leaveRoomUseCase(ws.auth.userId)

    sendServerResponse(ws, WebSocketServerEventEnum.USER_LEFT_ROOM, {
      roomId: result.roomId,
      roomDeleted: result.roomDeleted,
    })
  } catch (error) {
    if (error instanceof RoomNotFoundError) {
      sendServerResponse(ws, WebSocketServerEventEnum.ROOM_NOT_FOUND, {
        message: error.message,
      })
      return
    }

    if (error instanceof UserNotInRoomError) {
      sendServerResponse(ws, WebSocketServerEventEnum.USER_NOT_IN_ROOM, {
        message: error.message,
      })
      return
    }

    console.error('Error handling leave room:', error)
  }
}
