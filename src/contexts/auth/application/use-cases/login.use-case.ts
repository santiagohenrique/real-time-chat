import { JwtTokenService } from '../../infra/jwt-token.service'
import { randomUUID } from 'node:crypto'
import { LoginInput } from '../dtos/register-user.input'
import z from 'zod'
import { KeyValueStore } from '../../../../infra/key-value.store'
import { redisKeys } from '../../../../infra/redis/redis-keys'

const USER_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days in seconds

const cachedUserSchema = z.object({
  id: z.uuid(),
  name: z.string().min(3).max(20),
  normalizedName: z.string().min(3),
  refreshToken: z.string().min(1),
})

type CachedUser = z.infer<typeof cachedUserSchema>

export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtTokenService,
    private readonly keyValueStore: KeyValueStore
  ) {}

  async execute(userData: LoginInput): Promise<string> {
    const displayName = userData.name
    const normalizedName = displayName.toLowerCase()

    const userId = randomUUID()
    let tokens = this.jwtService.generateTokens({ userId, name: displayName })

    const existingUser = await this.getUserFromRedis(normalizedName)

    if (!existingUser) {
      const userCreated = await this.setUserInRedis({
        displayName,
        normalizedName,
        refreshToken: tokens.refreshToken,
        userId,
      })

      if (userCreated) {
        return tokens.accessToken
      }

      const reloadedUser = await this.getUserFromRedis(normalizedName)

      if (!reloadedUser) {
        throw new Error('User could not be persisted or reloaded from Redis')
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

  private async setUserInRedis(userData: {
    userId: string
    displayName: string
    normalizedName: string
    refreshToken: string
  }): Promise<boolean> {
    const { userId, displayName, normalizedName, refreshToken } = userData
    const userIdKey = redisKeys.auth.userById(userId)
    const usernameKey = redisKeys.auth.userByName(normalizedName)

    await this.keyValueStore.setIfNotExists(
      usernameKey,
      JSON.stringify({
        id: userId,
        name: displayName,
        normalizedName,
        refreshToken,
      }),
      { ttlInSeconds: USER_TTL_SECONDS },
    )

    return await this.keyValueStore.setIfNotExists(
      userIdKey,
      JSON.stringify({
        id: userId,
        name: displayName,
        normalizedName,
        refreshToken,
      }),
      { ttlInSeconds: USER_TTL_SECONDS },
    )
  }

  private async getUserFromRedis(
    normalizedName: string,
  ): Promise<CachedUser | null> {
    const usernameKey = redisKeys.auth.userByName(normalizedName)
    const existingUser = await this.keyValueStore.get(usernameKey)
    const parsedUser = cachedUserSchema.safeParse(JSON.parse(existingUser!))

    if (!parsedUser.success) {
      return null
    }

    return parsedUser.data
  }

  private async updateUserInRedis(userData: CachedUser): Promise<void> {
    const userIdKey = redisKeys.auth.userById(userData.id)

    await this.keyValueStore.set(
      userIdKey, 
      JSON.stringify(userData), 
      {
        ttlInSeconds: USER_TTL_SECONDS,
      }
    )
  }
}
