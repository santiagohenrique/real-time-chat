import { WebSocket } from 'ws'
import { WebSocketClientEventEnum } from '../../protocol/events'
import {
  BaseHandler,
  JoinRoomMessage,
  LeaveRoomMessage,
  ListAvailableRoomsMessage,
} from '../../protocol/messages'

export const handlers: Record<WebSocketClientEventEnum, BaseHandler> = {
  [WebSocketClientEventEnum.join_room]: (ws, message) => {
    const typedMessage = message as JoinRoomMessage
    handleJoinRoom(ws, typedMessage)
  },
  [WebSocketClientEventEnum.leave_room]: (ws, message) => {
    const typedMessage = message as LeaveRoomMessage
    handleLeaveRoom(ws, typedMessage)
  },
  [WebSocketClientEventEnum.list_available_rooms]: (ws, message) => {
    const typedMessage = message as ListAvailableRoomsMessage
    handleListAvailableRooms(ws, typedMessage)
  },
}

const handleJoinRoom = (ws: WebSocket, message: JoinRoomMessage) => {
  console.log('Cliente entrou na sala:', message.payload)
}

const handleLeaveRoom = (ws: WebSocket, message: LeaveRoomMessage) => {
  console.log('Cliente saiu da sala:', message.payload)
}

const handleListAvailableRooms = (
  ws: WebSocket,
  message: ListAvailableRoomsMessage
) => {
  console.log('Listando salas disponíveis')
}
