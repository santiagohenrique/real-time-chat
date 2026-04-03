import { WebSocket } from 'ws'
import { WebSocketClientEventEnum } from './enums/client-events.enum'
import { JoinRoomPayload } from './schemas/zod/join-room.schema'

type ClientEventPayloadMap = {
  [WebSocketClientEventEnum.JOIN_ROOM]: JoinRoomPayload
  [WebSocketClientEventEnum.LEAVE_ROOM]: {}
  [WebSocketClientEventEnum.LIST_AVAILABLE_ROOMS]: {}
}

export type WsMessage<T extends WebSocketClientEventEnum = WebSocketClientEventEnum> =
  {
    type: T
    data: ClientEventPayloadMap[T]
  }

export type JoinRoomMessage = WsMessage<WebSocketClientEventEnum.JOIN_ROOM>

export type LeaveRoomMessage = WsMessage<WebSocketClientEventEnum.LEAVE_ROOM>

export type ListAvailableRoomsMessage =
  WsMessage<WebSocketClientEventEnum.LIST_AVAILABLE_ROOMS>

export type BaseHandler = (ws: WebSocket, message: WsMessage) => void
