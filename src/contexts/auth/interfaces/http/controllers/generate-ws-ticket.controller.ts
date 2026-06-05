import { Request, Response } from "express"
import { GenerateWsTicketUseCase } from "../../../application/use-cases/generate-ws-ticket.use-case"
import { StatusCodes } from "http-status-codes"
import { JwtTokenService } from "../../../infra/jwt-token.service"

export class GenerateWsTicketController {
  constructor(
    private readonly generateWsTicketUseCase: GenerateWsTicketUseCase,
    private readonly jwtTokenService: JwtTokenService
  ) {}

  async handle(request: Request, response: Response) {
    try {
      const token = request.headers.authorization?.split(' ')[1]

      if(!token) {
        response.status(StatusCodes.UNAUTHORIZED).json({ 
          message: 'Access denied!'
        })
        return
      }

      const decodedToken = this.jwtTokenService.verifyToken(token, 'access')  

      if(!decodedToken) {
        response.status(StatusCodes.UNAUTHORIZED).json({ 
          message: 'Invalid token!'
        })
        return
      }

      const wsTicket = await this.generateWsTicketUseCase.execute(decodedToken.user)

      response.status(200).json({ wsTicket })
    } catch(error) {
      console.error('[GenerateWsTicketController] Error:', error)
      response.status(500).json({ error: 'Failed to login user' })
    }
  }
  
}