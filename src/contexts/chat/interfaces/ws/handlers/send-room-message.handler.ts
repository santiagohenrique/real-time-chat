import { HandlerDeps } from ".";
import { WebSocketServerEventEnum } from "../../../../../protocol/enums/server-events.enum";
import { SendRoomMessage } from "../../../../../protocol/messages";
import { sendRoomMessagePayloadSchema } from "../../../../../protocol/schemas/zod/send-room-message.schema";
import { AuthenticatedWebSocket } from "../../../../../servers/websocket-server";
import { sendServerResponse } from "../../../../../utils/send-server-response";

export const handleSendRoomMessage = async (
  ws: AuthenticatedWebSocket,
  message: SendRoomMessage,
  dependencies: HandlerDeps
) => {
  try {
    const parsedPayload = sendRoomMessagePayloadSchema.safeParse(message.data)

    if (!parsedPayload.success) {
      sendServerResponse(ws, WebSocketServerEventEnum.INVALID_SCHEMA, {
        errors: parsedPayload.error,
      })
      return
    }

    const { text } = parsedPayload.data

    const result = await dependencies.roomManagerService.sendRoomMessageUseCase(
      ws.auth,
      text
    )

    dependencies.roomBroadcaster.broadcastToRoom({
      roomId: result.roomId,
      event: WebSocketServerEventEnum.ROOM_MESSAGE_RECEIVED,
      data: result
    })
  } catch(error) {
    console.error('Error sending message room:', error)
  }
}