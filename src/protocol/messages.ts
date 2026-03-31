import { WebSocket } from 'ws'
import { WebSocketClientEventEnum } from './events'

type ClientEventPayloadMap = {
  [WebSocketClientEventEnum.join_room]: {
    roomName: string
  }
  [WebSocketClientEventEnum.leave_room]: {}
  [WebSocketClientEventEnum.list_available_rooms]: {}
}

export type WsMessage<
  T extends WebSocketClientEventEnum = WebSocketClientEventEnum
> = {
  type: T
  payload: ClientEventPayloadMap[T]
}

export type JoinRoomMessage = WsMessage<WebSocketClientEventEnum.join_room>

export type LeaveRoomMessage = WsMessage<WebSocketClientEventEnum.leave_room>

export type ListAvailableRoomsMessage =
  WsMessage<WebSocketClientEventEnum.list_available_rooms>

export type BaseHandler = (ws: WebSocket, message: WsMessage) => void
