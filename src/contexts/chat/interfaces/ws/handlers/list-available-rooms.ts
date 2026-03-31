import { WebSocket } from 'ws'
import { ListAvailableRoomsMessage } from '../../../../protocol/messages'

export const handleListAvailableRooms = (
  ws: WebSocket,
  message: ListAvailableRoomsMessage
) => {
  console.log('Listando salas disponíveis')
}
