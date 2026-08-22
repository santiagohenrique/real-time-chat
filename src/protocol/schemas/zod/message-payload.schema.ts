import z from 'zod'
import { WebSocketClientEventEnum } from '../../enums/client-events.enum'
import { createRoomPayloadSchema } from './create-room.schema'
import { joinRoomPayloadSchema } from './join-room.schema'
import { sendRoomMessagePayloadSchema } from './send-room-message.schema'

export const messagePayloadSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(WebSocketClientEventEnum.CREATE_ROOM),
    data: createRoomPayloadSchema,
  }),
  z.object({
    type: z.literal(WebSocketClientEventEnum.JOIN_ROOM),
    data: joinRoomPayloadSchema,
  }),
  z.object({
    type: z.literal(WebSocketClientEventEnum.LEAVE_ROOM),
  }),
  z.object({
    type: z.literal(WebSocketClientEventEnum.LIST_ROOMS),
  }),
  z.object({
    type: z.literal(WebSocketClientEventEnum.LIST_ROOM_USERS),
    data: joinRoomPayloadSchema,
  }),
  z.object({
    type: z.literal(WebSocketClientEventEnum.SEND_ROOM_MESSAGE),
    data: sendRoomMessagePayloadSchema,
  })
])

export type MessagePayload = z.infer<typeof messagePayloadSchema>
