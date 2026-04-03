import { Request, Response } from 'express'
import { RegisterUserInput } from '../../../application/dtos/register-user.input'
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case'
import { registerUserSchema } from '../../../../../protocol/schemas/zod/register-user.schema'
import { UserAlreadyExistsError } from '../../../domain/user-already-exists.error'

export class RegisterUserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async handle(request: Request, response: Response): Promise<void> {
    try {
      const userData = request.body

      const parsedData = registerUserSchema.safeParse(userData)
      if (!parsedData.success) {
        const flattenedErrors = parsedData.error.flatten()

        response.status(400).json({
          error: 'Invalid user data',
          details: {
            formErrors: flattenedErrors.formErrors,
            fieldErrors: flattenedErrors.fieldErrors,
          },
        })
        return
      }

      const registerUserInput: RegisterUserInput = {
        name: parsedData.data.name,
      }

      const accessToken =
        await this.registerUserUseCase.execute(registerUserInput)

      response.status(201).json({ accessToken })
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        response.status(409).json({
          error: error.message,
        })
        return
      }

      console.error('[RegisterUserController] Error:', error)
      response.status(500).json({ error: 'Failed to register user' })
    }
  }
}
