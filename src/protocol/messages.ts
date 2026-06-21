import { WebSocketClientEventEnum } from './enums/client-events.enum'
import { CreateRoomPayload } from './schemas/zod/create-room.schema'
import { AuthenticatedWebSocket } from '../servers/websocket-server'
import { JoinRoomPayload } from './schemas/zod/join-room.schema'

type ClientEventPayloadMap = {
  [WebSocketClientEventEnum.CREATE_ROOM]: CreateRoomPayload
  [WebSocketClientEventEnum.JOIN_ROOM]: JoinRoomPayload
  [WebSocketClientEventEnum.LEAVE_ROOM]: undefined
  [WebSocketClientEventEnum.LIST_ROOMS]: undefined
  [WebSocketClientEventEnum.LIST_ROOM_USERS]: JoinRoomPayload
}

export type WsMessage<T extends WebSocketClientEventEnum = WebSocketClientEventEnum> =
  T extends WebSocketClientEventEnum
    ? ClientEventPayloadMap[T] extends undefined
      ? { type: T }
          : { type: T; data: ClientEventPayloadMap[T] }
        : never

  
export type CreateRoomMessage = WsMessage<WebSocketClientEventEnum.CREATE_ROOM>

export type JoinRoomMessage = WsMessage<WebSocketClientEventEnum.JOIN_ROOM>

export type LeaveRoomMessage = WsMessage<WebSocketClientEventEnum.LEAVE_ROOM>

export type ListRoomsMessage =
  WsMessage<WebSocketClientEventEnum.LIST_ROOMS>

export type ListRoomUsersMessage =
  WsMessage<WebSocketClientEventEnum.LIST_ROOM_USERS>

export type BaseHandler = (ws: AuthenticatedWebSocket, message: WsMessage) => Promise<void>
