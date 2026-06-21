import { WebSocketClientEventEnum } from '../../../../../protocol/enums/client-events.enum'
import {
  BaseHandler,
  CreateRoomMessage,
  JoinRoomMessage,
  ListRoomUsersMessage,
} from '../../../../../protocol/messages'
import { RedisRoomStore } from '../../../infra/persistence/redis-room.store'
import { RoomManagerService } from '../../../domain/services/room-manager.service'
import { handleCreateRoom } from './create-room.handler'
import { handleJoinRoom } from './join-room.handler'
import { handleLeaveRoom } from './leave-room'
import { handleListRooms } from './list-rooms.handler'
import { handleListRoomUsers } from './list-room-users.handler'

const roomStore = new RedisRoomStore()
export const roomManagerService = new RoomManagerService(roomStore)

export const handlers: Record<WebSocketClientEventEnum, BaseHandler> = {
  [WebSocketClientEventEnum.CREATE_ROOM]: async (ws, message) => {
    const typedMessage = message as CreateRoomMessage
    await handleCreateRoom(ws, typedMessage)
  },
  [WebSocketClientEventEnum.JOIN_ROOM]: async (ws, message) => {
    const typedMessage = message as JoinRoomMessage
    await handleJoinRoom(ws, typedMessage)
  },
  [WebSocketClientEventEnum.LEAVE_ROOM]: async (ws) => {
    await handleLeaveRoom(ws)
  },
  [WebSocketClientEventEnum.LIST_ROOMS]: async (ws, _message) => {
    await handleListRooms(ws)
  },
  [WebSocketClientEventEnum.LIST_ROOM_USERS]: async (ws, message) => {
    const typedMessage = message as ListRoomUsersMessage
    await handleListRoomUsers(ws, typedMessage)
  },
}
