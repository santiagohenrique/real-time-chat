import { WebSocket } from 'ws'
import { ListAvailableRoomsMessage } from '../../../../../protocol/messages'
import { roomManagerService } from '.'
import { sendServerResponse } from '../../../../../utils/send-server-response'
import { WebSocketServerEventEnum } from '../../../../../protocol/server-events'

export const handleListAvailableRooms = (
  ws: WebSocket,
  message: ListAvailableRoomsMessage
) => {
  try {
    const availableRooms = roomManagerService.listAvailableRooms()

    sendServerResponse(ws, WebSocketServerEventEnum.SHOW_AVAILABLE_ROOMS, {
      rooms: availableRooms,
    })
  } catch (error) {
    console.error('Error handling list available rooms:', error)
  }
}
