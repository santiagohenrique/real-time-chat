import { Request } from 'express'
import { VerifiedTokenPayload } from '../../../infra/jwt-token.service'

export type AuthenticatedRequest = Request & {
  auth: VerifiedTokenPayload
}
