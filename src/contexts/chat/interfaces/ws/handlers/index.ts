import { WebSocketClientEventEnum } from '../../../../../protocol/client-events'
import {
  BaseHandler,
  JoinRoomMessage,
  LeaveRoomMessage,
  ListAvailableRoomsMessage,
} from '../../../../../protocol/messages'
import { RoomManagerService } from '../../../domain/services/room-manager.service'
import { handleJoinRoom } from './join-room.handler'
import { handleLeaveRoom } from './leave-room'
import { handleListAvailableRooms } from './list-available-rooms.handler'

export const roomManagerService = new RoomManagerService()

export const handlers: Record<WebSocketClientEventEnum, BaseHandler> = {
  [WebSocketClientEventEnum.JOIN_ROOM]: (ws, message) => {
    const typedMessage = message as JoinRoomMessage
    handleJoinRoom(ws, typedMessage)
  },
  [WebSocketClientEventEnum.LEAVE_ROOM]: (ws, message) => {
    const typedMessage = message as LeaveRoomMessage
    handleLeaveRoom(ws, typedMessage)
  },
  [WebSocketClientEventEnum.LIST_AVAILABLE_ROOMS]: (ws, message) => {
    const typedMessage = message as ListAvailableRoomsMessage
    handleListAvailableRooms(ws, typedMessage)
  },
}
