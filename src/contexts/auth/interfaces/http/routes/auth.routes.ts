import { Router } from 'express'
import { RegisterUserController } from '../controllers/register-user.controller'
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case'
import { JwtTokenService } from '../../../infra/jwt-token.service'

const authRoutes: ReturnType<typeof Router> = Router()

const jwtTokenService = new JwtTokenService()
const registerUserUseCase = new RegisterUserUseCase(jwtTokenService)
const registerUserController = new RegisterUserController(registerUserUseCase)

authRoutes.post('/register', async (request, response) => {
  await registerUserController.handle(request, response)
})

export { authRoutes }
