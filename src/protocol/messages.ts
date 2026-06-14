import { WebSocketClientEventEnum } from './enums/client-events.enum'
import { CreateRoomPayload } from './schemas/zod/create-room.schema'
import { AuthenticatedWebSocket } from '../servers/websocket-server'

type ClientEventPayloadMap = {
  [WebSocketClientEventEnum.CREATE_ROOM]: CreateRoomPayload
  [WebSocketClientEventEnum.JOIN_ROOM]: {
    roomId: string
  }
  [WebSocketClientEventEnum.LEAVE_ROOM]: {}
  [WebSocketClientEventEnum.LIST_AVAILABLE_ROOMS]: {}
}

export type WsMessage<T extends WebSocketClientEventEnum = WebSocketClientEventEnum> =
  {
    type: T
    data: ClientEventPayloadMap[T]
  }

export type CreateRoomMessage = WsMessage<WebSocketClientEventEnum.CREATE_ROOM>

export type JoinRoomMessage = WsMessage<WebSocketClientEventEnum.JOIN_ROOM>

export type LeaveRoomMessage = WsMessage<WebSocketClientEventEnum.LEAVE_ROOM>

export type ListAvailableRoomsMessage =
  WsMessage<WebSocketClientEventEnum.LIST_AVAILABLE_ROOMS>

export type BaseHandler = (ws: AuthenticatedWebSocket, message: WsMessage) => Promise<void>
