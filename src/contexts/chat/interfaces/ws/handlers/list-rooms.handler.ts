import { WebSocket } from 'ws'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { HandlerDeps } from '.'

export const handleListRooms = async (
  ws: WebSocket,
  dependencies: HandlerDeps,
) => {
  try {
    const rooms = await dependencies.roomManagerService.listRoomsUseCase()

    sendServerResponse(ws, WebSocketServerEventEnum.LIST_ROOMS_RESULT, {
      rooms,
    })
  } catch (error) {
    console.error('Error handling list rooms:', error)
  }
}
