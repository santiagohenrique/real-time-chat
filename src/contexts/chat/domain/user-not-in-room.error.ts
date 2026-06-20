export class UserNotInRoomError extends Error {
  constructor() {
    super('User is not in a room')
    this.name = 'UserNotInRoomError'
  }
}
