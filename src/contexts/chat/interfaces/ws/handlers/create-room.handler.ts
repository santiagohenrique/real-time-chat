import { roomManagerService } from "."
import { WebSocketServerEventEnum } from "../../../../../protocol/enums/server-events.enum"
import { CreateRoomMessage } from "../../../../../protocol/messages"
import { createRoomPayloadSchema } from "../../../../../protocol/schemas/zod/create-room.schema"
import { AuthenticatedWebSocket } from "../../../../../servers/websocket-server"
import { sendServerResponse } from "../../../../../utils/send-server-response"

export const handleCreateRoom = async (ws: AuthenticatedWebSocket, message: CreateRoomMessage) => {
  try {
    const parsedPayload = createRoomPayloadSchema.safeParse(message.data)

    if (!parsedPayload.success) {
      sendServerResponse(ws, WebSocketServerEventEnum.INVALID_SCHEMA, {
        errors: parsedPayload.error,
      })
      return
    }
    
    const { roomName } = parsedPayload.data

    const room = await roomManagerService.createRoomUseCase({
      roomName
    })

    sendServerResponse(
      ws, WebSocketServerEventEnum.USER_CREATED_ROOM, 
      {
        room
      }
    )
  } catch (error) {
    console.error('Error handling join room:', error)
  }
}
