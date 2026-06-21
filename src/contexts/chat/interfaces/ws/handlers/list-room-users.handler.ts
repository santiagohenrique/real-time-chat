import { WebSocket } from 'ws'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { roomManagerService } from '.'
import { ListRoomUsersMessage } from '../../../../../protocol/messages'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'

export const handleListRoomUsers = async (
  ws: WebSocket,
  message: ListRoomUsersMessage
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

    const users = await roomManagerService.listRoomUsersUseCase({
      roomId
    })

    sendServerResponse(ws, WebSocketServerEventEnum.LIST_ROOM_USERS_RESULT, { users } )
  } catch (error) {
    console.error('Error handling list rooms:', error)
  }
}
