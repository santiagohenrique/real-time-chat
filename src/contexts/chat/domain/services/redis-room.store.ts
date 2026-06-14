import { getRedisClient } from '../../../../infra/redis/redis-client'
import { Room } from '../entities/room'

export type AvailableRoom = {
  id: string
  name: string
}


export interface RoomStore {
  createRoom(room: Room): Promise<void>
  addUserToRoom(roomId: string, userId: string): Promise<void>
  listAvailableRooms(): Promise<AvailableRoom[]>
  listUsersInAroomUseCase(roomId: string): Promise<string[]>
}

export class RedisRoomStore implements RoomStore {

  async createRoom(room: Room): Promise<void> {
    await getRedisClient().sAdd('chat:rooms', JSON.stringify(room))
  }

  async addUserToRoom(roomId: string, userId: string): Promise<void> {
    await getRedisClient().sAdd(`chat:room:${roomId}:members`, userId)
  }

  async listAvailableRooms(): Promise<AvailableRoom[]> {
    const roomIds = await getRedisClient().sMembers('chat:rooms')

    const roomKeys = roomIds.map((roomId) => `chat:room:${roomId}`)
    const rawRooms = await getRedisClient().mGet(roomKeys)

    return rawRooms
      .filter((room): room is string => room !== null)
      .map((room) => JSON.parse(room) as AvailableRoom)
  }

  async listUsersInAroomUseCase(): Promise<string[]> {
    return await getRedisClient().sMembers('chat:rooms')
  }
}
