import { WebSocket } from 'ws'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { ListRoomUsersMessage } from '../../../../../protocol/messages'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'
import { RoomNotFoundError } from '../../../domain/room-not-found.error'
import { HandlerDeps } from '.'

export const handleListRoomUsers = async (
  ws: WebSocket,
  message: ListRoomUsersMessage,
  dependencies: HandlerDeps,
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

    const users = await dependencies.roomManagerService.listRoomUsersUseCase({
      roomId
    })

    sendServerResponse(ws, WebSocketServerEventEnum.LIST_ROOM_USERS_RESULT, { users } )
  } catch (error) {
    if (error instanceof RoomNotFoundError) {
      sendServerResponse(ws, WebSocketServerEventEnum.ROOM_NOT_FOUND, {
        message: error.message,
      })
      return
    }
    console.error('Error handling list rooms:', error)
  }
}
