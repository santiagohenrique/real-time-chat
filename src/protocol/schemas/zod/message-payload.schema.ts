import z from 'zod'
import { WebSocketClientEventEnum } from '../../client-events.enum'

export const messagePayloadSchema = z.object({
  type: z.enum(WebSocketClientEventEnum),
  data: z.record(z.string(), z.unknown()),
})

export type MessagePayload = z.infer<typeof messagePayloadSchema>
