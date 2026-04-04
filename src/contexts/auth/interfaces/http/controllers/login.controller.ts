import { Request, Response } from 'express'
import { registerUserSchema } from '../../../../../protocol/schemas/zod/register-user.schema'
import { LoginInput } from '../../../application/dtos/register-user.input'
import { LoginUseCase } from '../../../application/use-cases/login.use-case'

export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

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

      const loginInput: LoginInput = {
        name: parsedData.data.name,
      }

      const accessToken = await this.loginUseCase.execute(loginInput)

      response.status(200).json({ accessToken })
    } catch (error) {
      console.error('[LoginController] Error:', error)
      response.status(500).json({ error: 'Failed to login user' })
    }
  }
}
