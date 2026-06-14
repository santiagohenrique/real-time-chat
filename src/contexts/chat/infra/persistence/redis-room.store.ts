import { getRedisClient } from '../../../../infra/redis/redis-client'
import { RoomListItem } from '../../application/dtos/rooms.dto'
import { RoomStore } from '../../application/ports/room.store'
import { Room } from '../../domain/entities/room'

export class RedisRoomStore implements RoomStore {

  async createRoom(room: Room): Promise<void> {
    await getRedisClient()
      .multi()
      .sAdd('chat:rooms', room.getId())
      .set(
        `chat:room:${room.getId()}`,
        JSON.stringify({
          id: room.getId(),
          name: room.getName(),
        }),
      )
      .exec()
  }

  async addUserToRoom(roomId: string, userId: string): Promise<boolean> {
    const roomKey = `chat:room:${roomId}`
    const roomMembersKey = `chat:room:${roomId}:members`

    const result = await getRedisClient().eval(
      `
        if redis.call('EXISTS', KEYS[1]) == 0 then
          return 0
        end

        redis.call('SADD', KEYS[2], ARGV[1])
        return 1
      `,
      {
        keys: [roomKey, roomMembersKey],
        arguments: [userId],
      },
    )

    return result === 1
  }

  async listRooms(): Promise<RoomListItem[]> {
    const roomIds = await getRedisClient().sMembers('chat:rooms')

    const roomKeys = roomIds.map((roomId) => `chat:room:${roomId}`)
    const rawRooms = await getRedisClient().mGet(roomKeys)

    return rawRooms
      .filter((room): room is string => room !== null)
      .map((room) => JSON.parse(room) as RoomListItem)
  }
}
