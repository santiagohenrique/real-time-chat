import { RedisKeyValueStore } from "../../infra/redis/redis-key-value.store"
import { GenerateWsTicketUseCase } from "./application/use-cases/generate-ws-ticket.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { JwtTokenService } from "./infra/jwt-token.service"
import { GenerateWsTicketController } from "./interfaces/http/controllers/generate-ws-ticket.controller"
import { LoginController } from "./interfaces/http/controllers/login.controller"
import { RedisWsTicketStore } from "./redis-ws-ticket.store"

const jwtTokenService = new JwtTokenService()
const redisKeyValueStore = new RedisKeyValueStore()
const redisWsTicketStore = new RedisWsTicketStore(redisKeyValueStore)

const makeLoginUseCase = () => {
  const loginUseCase = new LoginUseCase(
    jwtTokenService,
    redisKeyValueStore
  )

  return loginUseCase
}

export const makeGenerateWsTicketController = () => {
  const generateWsTicketUseCase = new GenerateWsTicketUseCase(redisWsTicketStore)
  
  return new GenerateWsTicketController(
    generateWsTicketUseCase,
  )
}

export const loginController = new LoginController(makeLoginUseCase())
export const generateWsTicketController = makeGenerateWsTicketController()