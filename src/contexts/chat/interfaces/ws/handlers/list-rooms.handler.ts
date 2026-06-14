import { WebSocket } from 'ws'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { roomManagerService } from '.'

export const handleListRooms = async (
  ws: WebSocket,
) => {
  try {
    const rooms = await roomManagerService.listRoomsUseCase()

    sendServerResponse(ws, WebSocketServerEventEnum.SHOW_ROOMS, {
      rooms,
    })
  } catch (error) {
    console.error('Error handling list rooms:', error)
  }
}
