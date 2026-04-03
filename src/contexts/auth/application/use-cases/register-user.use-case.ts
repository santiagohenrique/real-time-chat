import { redisSetJsonIfNotExists } from '../../../../infra/redis/redis-set'
import { RegisterUserInput } from '../dtos/register-user.input'
import { UserAlreadyExistsError } from '../../domain/user-already-exists.error'
import { JwtTokenService } from '../../infra/jwt-token.service'
import { v4 as uuid } from 'uuid'

const USER_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days in seconds

export class RegisterUserUseCase {
  constructor(private readonly jwtService: JwtTokenService) {}

  async execute(userData: RegisterUserInput): Promise<string> {
    const normalizedName = userData.name.trim()

    const userId = uuid()
    const tokens = this.jwtService.generateTokens({
      userId,
      name: normalizedName,
    })

    const userCreated = await redisSetJsonIfNotExists(
      `user:${userId}`,
      {
        id: userId,
        uuid: userId,
        refreshToken: tokens.refreshToken,
      },
      { ttlInSeconds: USER_TTL_SECONDS },
    )

    if (!userCreated) {
      throw new UserAlreadyExistsError(normalizedName)
    }

    return tokens.accessToken
  }
}
