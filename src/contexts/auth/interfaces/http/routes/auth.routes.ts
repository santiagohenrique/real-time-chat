import { Router } from 'express'
import { generateWsTicketController, loginController } from '../../../auth.module'

const authRoutes: ReturnType<typeof Router> = Router()

authRoutes.post('/login', async (request, response) => {
  await loginController.handle(request, response)
})
authRoutes.post('/ws-ticket', async (request, response) => {
  await generateWsTicketController.handle(request, response)
})

export { authRoutes }
