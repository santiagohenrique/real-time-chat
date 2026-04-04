import { Router } from 'express'
import { JwtTokenService } from '../../../infra/jwt-token.service'
import { LoginController } from '../controllers/login.controller'
import { LoginUseCase } from '../../../application/use-cases/login.use-case'

const authRoutes: ReturnType<typeof Router> = Router()

const jwtTokenService = new JwtTokenService()
const loginUseCase = new LoginUseCase(jwtTokenService)
const loginController = new LoginController(loginUseCase)

authRoutes.post('/login', async (request, response) => {
  await loginController.handle(request, response)
})

export { authRoutes }
