import { WebSocket } from 'ws'
import { JoinRoomMessage } from '../../../../../protocol/messages'
import { WebSocketServerEventEnum } from '../../../../../protocol/server-events'
import { joinRoomPayloadSchema } from '../../../../../protocol/schemas/zod/join-room.schema'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { roomManagerService } from '.'

export const handleJoinRoom = (ws: WebSocket, message: JoinRoomMessage) => {
  try {
    const parsedPayload = joinRoomPayloadSchema.safeParse(message.data)

    if (!parsedPayload.success) {
      sendServerResponse(ws, WebSocketServerEventEnum.INVALID_SCHEMA, {
        errors: parsedPayload.error,
      })
      return
    }

    roomManagerService.createRoom(message.data.roomName)
    roomManagerService.joinRoom(message.data.roomName, message.data.userId)

    sendServerResponse(ws, WebSocketServerEventEnum.USER_JOINED_ROOM, {
      roomName: message.data.roomName,
    })
  } catch (error) {
    console.error('Error handling join room:', error)
  }
}