import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JwtTokenService } from '../../../infra/jwt-token.service'

const jwtService = new JwtTokenService()

export const verifyTokenMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const token = request.headers.authorization?.split(' ')[1]

  if (!token) {
    response.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Access denied!',
    })
    return
  }

  const decodedToken = jwtService.verifyToken(token, 'access')

  if (!decodedToken) {
    response.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid token!',
    })
    return
  }

  request.auth = decodedToken
  next()
}
