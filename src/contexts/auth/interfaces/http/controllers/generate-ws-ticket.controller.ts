import { Response } from 'express'
import { GenerateWsTicketUseCase } from '../../../application/use-cases/generate-ws-ticket.use-case'
import { AuthenticatedRequest } from '../types/authenticated-request.type'

export class GenerateWsTicketController {
  constructor(private readonly generateWsTicketUseCase: GenerateWsTicketUseCase) {}

  async handle(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const auth = request.auth

      const wsTicket = await this.generateWsTicketUseCase.execute(auth.user)

      response.status(200).json({ wsTicket })
    } catch (error) {
      console.error('[GenerateWsTicketController] Error:', error)
      response.status(500).json({ error: 'Failed to generate ws ticket' })
    }
  }
}
