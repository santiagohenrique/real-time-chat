import { Room } from '../entities/room'

export class RoomManagerService {
  private rooms: Map<string, Set<string>> = new Map()

  createRoom(roomName: string): Room {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set())
    }
    return new Room(roomName)
  }

  joinRoom(roomName: string, userId: string): boolean {
    if (!this.rooms.has(roomName)) {
      throw new Error(`Room ${roomName} does not exist`)
    }
    this.rooms.get(roomName)?.add(userId)
    return true
  }

  listAvailableRooms(): string[] {
    return Array.from(this.rooms.keys())
  }
}
