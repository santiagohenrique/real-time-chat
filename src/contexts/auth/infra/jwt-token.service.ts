import jwt, { SignOptions } from 'jsonwebtoken'
import z from 'zod'

const tokenUserSchema = z.object({
  userId: z.uuid(),
  name: z.string().min(3).max(20),
})

const verifiedTokenPayloadSchema = z.object({
  sub: z.uuid(),
  tokenType: z.enum(['access', 'refresh']),
  user: tokenUserSchema,
})

type TokenType = z.infer<typeof verifiedTokenPayloadSchema>['tokenType']
type TokenUser = z.infer<typeof tokenUserSchema>

type VerifiedTokenPayload = {
  userId: string
  tokenType: TokenType
  user: TokenUser
}

export class JwtTokenService {
  private secretKey: string
  private issuer: string
  private audience: string

  constructor() {
    const jwtSecretKey = process.env.JWT_SECRET_KEY

    if (!jwtSecretKey) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables')
    }

    this.secretKey = jwtSecretKey
    this.issuer = process.env.JWT_ISSUER?.trim() || 'real-time-chat'
    this.audience = process.env.JWT_AUDIENCE?.trim() || 'real-time-chat-client'
  }

  private signToken(
    userData: TokenUser,
    tokenType: TokenType,
    expiresIn: NonNullable<SignOptions['expiresIn']>,
  ): string {
    const { userId } = userData
    return jwt.sign(
      {
        tokenType,
        user: userData,
      },
      this.secretKey,
      {
        algorithm: 'HS256',
        audience: this.audience,
        expiresIn,
        issuer: this.issuer,
        subject: userId,
      },
    )
  }

  generateTokens(userData: TokenUser): {
    accessToken: string
    refreshToken: string
  } {
    const accessToken = this.signToken(userData, 'access', '10m')
    const refreshToken = this.signToken(userData, 'refresh', '7d')

    return {
      accessToken,
      refreshToken,
    }
  }

  generateTokenWithRefreshToken(refreshToken: string): {
    accessToken: string
    refreshToken: string
  } {
    const userData = this.verifyToken(refreshToken, 'refresh')

    if (!userData) {
      throw new Error('Invalid refresh token')
    }

    const accessToken = this.signToken(userData.user, 'access', '10m')
    const newRefreshToken = this.signToken(userData.user, 'refresh', '7d')

    return {
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  verifyToken(
    token: string,
    expectedTokenType?: TokenType,
  ): VerifiedTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secretKey, {
        algorithms: ['HS256'],
        audience: this.audience,
        issuer: this.issuer,
      })

      if (typeof decoded !== 'object' || decoded === null) {
        return null
      }

      const parsedPayload = verifiedTokenPayloadSchema.safeParse(decoded)

      if (!parsedPayload.success) {
        return null
      }

      const { sub, tokenType, user } = parsedPayload.data

      if (expectedTokenType && tokenType !== expectedTokenType) {
        return null
      }

      if (user.userId !== sub) {
        return null
      }

      return {
        userId: sub,
        tokenType,
        user,
      }
    } catch {
      console.warn('[auth] Invalid token')
      return null
    }
  }
}
