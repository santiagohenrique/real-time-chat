import * as z from 'zod'

export const joinRoomPayloadSchema = z.object({
  roomName: z.string().trim().min(1, `Room name can't be empty`),
  userId: z.string().trim().min(1, `User ID can't be empty`),
})

export type JoinRoomPayload = z.infer<typeof joinRoomPayloadSchema>
