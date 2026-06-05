import { randomBytes } from 'node:crypto'
import { redisSetJsonIfNotExists } from '../../../../infra/redis/redis-set'
import { TokenUser } from '../../infra/jwt-token.service'

export class GenerateWsTicketUseCase {
  constructor(){}

  async execute(user: TokenUser){
    const wsTicket = randomBytes(32).toString('base64url')
    const authKey = `ws:auth:${wsTicket}`

    const result: boolean = await redisSetJsonIfNotExists(
      authKey,
      user,
      {
        ttlInSeconds: 15
      }
    )

    if(!result) {
      throw new Error('Error generating ws ticket')
    }

    return wsTicket
  }
}