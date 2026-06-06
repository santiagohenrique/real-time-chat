import type { VerifiedTokenPayload } from '../../contexts/auth/infra/jwt-token.service'

declare global {
  namespace Express {
    interface Request {
      auth?: VerifiedTokenPayload
    }
  }
}

export {}
