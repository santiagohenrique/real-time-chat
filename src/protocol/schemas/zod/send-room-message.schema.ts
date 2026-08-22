import * as z from 'zod'

export const sendRoomMessagePayloadSchema = z.object({
  text: z.string().trim().min(1, `Text can't be empty`),
})

export type SendRoomMessagePayload = z.infer<typeof sendRoomMessagePayloadSchema>
