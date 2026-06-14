import { WebSocket } from 'ws'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { WebSocketServerEventEnum } from '../../../../../protocol/enums/server-events.enum'
import { roomManagerService } from '.'

export const handleListAvailableRooms = async (
  ws: WebSocket,
) => {
  try {
    const rooms = await roomManagerService.listAvailableRoomsUseCase()

    sendServerResponse(ws, WebSocketServerEventEnum.SHOW_AVAILABLE_ROOMS, {
      rooms,
    })
  } catch (error) {
    console.error('Error handling list available rooms:', error)
  }
}
