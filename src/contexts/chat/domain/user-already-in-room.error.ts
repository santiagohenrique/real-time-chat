export class UserAlreadyInRoomError extends Error {
  constructor(currentRoomId: string) {
    super(`User is already in room ${currentRoomId}`)
    this.name = 'UserAlreadyInRoomError'
  }
}
