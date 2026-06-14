import * as z from 'zod'

export const joinRoomPayloadSchema = z.object({
  roomId: z.uuidv4(),
})

export type JoinRoomPayload = z.infer<typeof joinRoomPayloadSchema>
