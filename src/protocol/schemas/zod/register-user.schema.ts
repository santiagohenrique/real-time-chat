import z from 'zod'

export const registerUserSchema = z.object({
  name: z.string().trim().min(3).max(20),
})
