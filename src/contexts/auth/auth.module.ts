import { GenerateWsTicketUseCase } from "./application/use-cases/generate-ws-ticket.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { JwtTokenService } from "./infra/jwt-token.service"
import { GenerateWsTicketController } from "./interfaces/http/controllers/generate-ws-ticket.controller"
import { LoginController } from "./interfaces/http/controllers/login.controller"

const makeLoginUseCase = () => {
  const jwtTokenService = new JwtTokenService()
  const loginUseCase = new LoginUseCase(jwtTokenService)

  return loginUseCase
}

export const makeGenerateWsTicketController = () => {
  const generateWsTicketUseCase = new GenerateWsTicketUseCase()
  const jwtTokenService = new JwtTokenService()
  
  return new GenerateWsTicketController(
    generateWsTicketUseCase,
    jwtTokenService,
  )
}

export const loginController = new LoginController(makeLoginUseCase())
export const generateWsTicketController = makeGenerateWsTicketController()