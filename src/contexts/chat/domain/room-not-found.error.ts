export class RoomNotFoundError extends Error {
  constructor(roomId: string) {
    super(`Room ${roomId} not found`)
    this.name = 'RoomNotFoundError'
  }
}
