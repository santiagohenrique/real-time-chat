import * as z from 'zod'

export const createRoomPayloadSchema = z.object({
  roomName: z.string().trim().min(1, `Room name can't be empty`),
})

export type CreateRoomPayload = z.infer<typeof createRoomPayloadSchema>
