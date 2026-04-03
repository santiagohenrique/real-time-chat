import jwt, { SignOptions } from 'jsonwebtoken'
import z from 'zod'

const verifiedTokenPayloadSchema = z.object({
  sub: z.uuid(),
  tokenType: z.enum(['access', 'refresh']),
})

type TokenType = z.infer<typeof verifiedTokenPayloadSchema>['tokenType']

type VerifiedTokenPayload = {
  userId: string
  tokenType: TokenType
}

type GenerateTokensInput = {
  userId: string
  name: string
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
    data: GenerateTokensInput,
    tokenType: TokenType,
    expiresIn: NonNullable<SignOptions['expiresIn']>,
  ): string {
    return jwt.sign(
      {
        tokenType,
        user: data,
      },
      this.secretKey,
      {
        algorithm: 'HS256',
        audience: this.audience,
        expiresIn,
        issuer: this.issuer,
        subject: data.userId,
      },
    )
  }

  generateTokens(data: GenerateTokensInput): {
    accessToken: string
    refreshToken: string
  } {
    const accessToken = this.signToken(data, 'access', '10m')
    const refreshToken = this.signToken(data, 'refresh', '7d')

    return {
      accessToken,
      refreshToken,
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

      const { sub, tokenType } = parsedPayload.data

      if (expectedTokenType && tokenType !== expectedTokenType) {
        return null
      }

      return {
        userId: sub,
        tokenType,
      }
    } catch {
      console.warn('[auth] Invalid token')
      return null
    }
  }
}
