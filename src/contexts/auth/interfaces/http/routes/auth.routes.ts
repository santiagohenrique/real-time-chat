import { Router } from 'express'
import { generateWsTicketController, loginController } from '../../../auth.module'
import { verifyTokenMiddleware } from '../middlewares/verify-token.middleware'
import { AuthenticatedRequest } from '../types/authenticated-request.type'

const authRoutes: ReturnType<typeof Router> = Router()

authRoutes.post('/login', async (request, response) => {
  await loginController.handle(request, response)
})

authRoutes.post('/ws-ticket', verifyTokenMiddleware, async (request, response) => {
  await generateWsTicketController.handle(
    request as AuthenticatedRequest,
    response,
  )
})

export { authRoutes }
