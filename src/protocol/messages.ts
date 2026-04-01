import { WebSocket } from 'ws'
import { WebSocketClientEventEnum } from './client-events.enum'

type ClientEventPayloadMap = {
  [WebSocketClientEventEnum.JOIN_ROOM]: {
    roomName: string
    userId: string
  }
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
