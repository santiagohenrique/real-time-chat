import z from 'zod'

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_@$.\x20]+$/,
      'Name can only contain letters, numbers, spaces, and _ @ $ . characters',
    ),
})
