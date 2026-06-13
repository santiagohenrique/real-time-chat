import { getRedisClient } from '../../../../infra/redis/redis-client'

export interface RoomStore {
  createRoom(roomName: string): Promise<void>
  addUserToRoom(roomName: string, userId: string): Promise<void>
  listAvailableRooms(): Promise<string[]>
}

export class RedisRoomStore implements RoomStore {

  async createRoom(roomName: string): Promise<void> {
    await getRedisClient().sAdd('chat:rooms', roomName)
  }

  async addUserToRoom(roomName: string, userId: string): Promise<void> {
    await getRedisClient().sAdd(`chat:room:${roomName}:members`, userId)
  }

  async listAvailableRooms(): Promise<string[]> {
    return await getRedisClient().sMembers('chat:rooms')
  }
}
