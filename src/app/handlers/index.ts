import { WebSocket } from 'ws'
import { WebSocketClientEventEnum } from '../../protocol/client-events'
import {
  BaseHandler,
  JoinRoomMessage,
  LeaveRoomMessage,
  ListAvailableRoomsMessage,
} from '../../protocol/messages'
import { handleJoinRoom } from './join-room'
import { handleLeaveRoom } from './leave-room'
import { handleListAvailableRooms } from './list-available-rooms'

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




