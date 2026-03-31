import z from 'zod'
import { WebSocketClientEventEnum } from '../client-events'

export const messagePayloadSchema = z.object({
  type: z.enum(WebSocketClientEventEnum),
  payload: z.record(z.string(), z.unknown()),
})

export type MessagePayload = z.infer<typeof messagePayloadSchema>
