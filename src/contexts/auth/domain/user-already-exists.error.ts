export class UserAlreadyExistsError extends Error {
  constructor(userName: string) {
    super(`User ${userName} already exists`)
    this.name = 'UserAlreadyExistsError'
  }
}
