import { JwtTokenService } from '../../infra/jwt-token.service'
import { randomUUID } from 'node:crypto'
import { redisGetJson } from '../../../../infra/redis/redis-get'
import { LoginInput } from '../dtos/register-user.input'
import z from 'zod'
import {
  redisSetJson,
  redisSetJsonIfNotExists,
} from '../../../../infra/redis/redis-set'

const USER_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days in seconds

const cachedUserSchema = z.object({
  id: z.uuid(),
  name: z.string().min(3).max(20),
  normalizedName: z.string().min(3),
  refreshToken: z.string().min(1),
})

type CachedUser = z.infer<typeof cachedUserSchema>

export class LoginUseCase {
  constructor(private readonly jwtService: JwtTokenService) {}

  async execute(userData: LoginInput): Promise<string> {
    const displayName = userData.name
    const normalizedName = displayName.toLowerCase()

    const userId = randomUUID()
    let tokens = this.jwtService.generateTokens({ userId, name: displayName })

    const userCreated = await this.setUserInRedis({
      displayName,
      normalizedName,
      refreshToken: tokens.refreshToken,
      userId,
    })

    if (userCreated) {
      return tokens.accessToken
    }

    const existingUser = await this.getUserFromRedis(normalizedName)

    if (!existingUser) {
      const recoveredByCreate = await this.setUserInRedis({
        displayName,
        normalizedName,
        refreshToken: tokens.refreshToken,
        userId,
      })

      if (recoveredByCreate) {
        return tokens.accessToken
      }

      const reloadedUser = await this.getUserFromRedis(normalizedName)

      if (!reloadedUser) {
        throw new Error('User exists but could not be loaded from Redis')
      }

      tokens = this.jwtService.generateTokenWithRefreshToken(
        reloadedUser.refreshToken,
      )

      await this.updateUserInRedis({
        ...reloadedUser,
        refreshToken: tokens.refreshToken,
      })

      return tokens.accessToken
    }

    tokens = this.jwtService.generateTokenWithRefreshToken(
      existingUser.refreshToken,
    )

    await this.updateUserInRedis({
      ...existingUser,
      refreshToken: tokens.refreshToken,
    })

    return tokens.accessToken
  }

  private setUserInRedis(userData: {
    userId: string
    displayName: string
    normalizedName: string
    refreshToken: string
  }): Promise<boolean> {
    const { userId, displayName, normalizedName, refreshToken } = userData
    return redisSetJsonIfNotExists(
      `user:${normalizedName}`,
      {
        id: userId,
        name: displayName,
        normalizedName,
        refreshToken,
      },
      { ttlInSeconds: USER_TTL_SECONDS },
    )
  }

  private async getUserFromRedis(
    normalizedName: string,
  ): Promise<CachedUser | null> {
    const existingUser = await redisGetJson<unknown>(`user:${normalizedName}`)

    const parsedUser = cachedUserSchema.safeParse(existingUser)

    if (!parsedUser.success) {
      return null
    }

    return parsedUser.data
  }

  private async updateUserInRedis(userData: CachedUser): Promise<void> {
    await redisSetJson(`user:${userData.normalizedName}`, userData, {
      ttlInSeconds: USER_TTL_SECONDS,
    })
  }
}
