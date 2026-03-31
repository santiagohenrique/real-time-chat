import z from 'zod'
import { WebSocketClientEventEnum } from '../../client-events'

export const messagePayloadSchema = z.object({
  event: z.enum(WebSocketClientEventEnum),
  data: z.record(z.string(), z.unknown()),
})

export type MessagePayload = z.infer<typeof messagePayloadSchema>
