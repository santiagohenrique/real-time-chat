import { getRedisClient } from '../../../../infra/redis/redis-client'
import { redisKeys } from '../../../../infra/redis/redis-keys'
import { RoomUsersItem } from '../../application/dtos/room-users.dto'
import { RoomListItem } from '../../application/dtos/rooms.dto'
import {
  AddUserToRoomResult,
  RemoveUserFromCurrentRoomResult,
  RoomStore,
} from '../../application/ports/room.store'
import { Room } from '../../domain/entities/room'

export class RedisRoomStore implements RoomStore {

  async createRoom(room: Room): Promise<void> {
    const roomsKey = redisKeys.chat.rooms()
    await getRedisClient()
      .multi()
      .sAdd(roomsKey, room.getId())
      .set(
        `chat:room:${room.getId()}`,
        JSON.stringify({
          id: room.getId(),
          name: room.getName(),
        }),
      )
      .exec()
  }

  async addUserToRoom(
    roomId: string,
    userId: string,
  ): Promise<AddUserToRoomResult> {
    const roomKey = redisKeys.chat.roomById(roomId)
    const roomMembersKey = redisKeys.chat.roomMembers(roomId)
    const userCurrentRoomKey = redisKeys.chat.userCurrentRoom(userId)

    const rawResult = await getRedisClient().eval(
      `
        if redis.call('EXISTS', KEYS[1]) == 0 then
          return cjson.encode({ status = 'room_not_found' })
        end

        local currentRoomId = redis.call('GET', KEYS[3])

        if currentRoomId then
          return cjson.encode({
            status = 'already_in_room',
            roomId = currentRoomId
          })
        end

        redis.call('SADD', KEYS[2], ARGV[1])
        redis.call('SET', KEYS[3], ARGV[2])

        return cjson.encode({ status = 'success' })
      `,
      {
        keys: [roomKey, roomMembersKey, userCurrentRoomKey],
        arguments: [userId, roomId],
      },
    )

    return JSON.parse(String(rawResult)) as AddUserToRoomResult
  }

  async listRooms(): Promise<RoomListItem[]> {
    const roomsKey = redisKeys.chat.rooms()
    const roomIds = await getRedisClient().sMembers(roomsKey)

    if (roomIds.length === 0) {
      return []
    }

    const roomKeys = roomIds.map((roomId) => redisKeys.chat.roomById(roomId))
    const rawRooms = await getRedisClient().mGet(roomKeys)

    return rawRooms
      .filter((room): room is string => room !== null)
      .map((room) => JSON.parse(room) as RoomListItem)
  }

  async listRoomUsers(roomId: string): Promise<RoomUsersItem[]> {
    const roomMembersKey = redisKeys.chat.roomMembers(roomId)
    const rawUsersId = await getRedisClient().sMembers(roomMembersKey)

    const usersPromises = rawUsersId.map(async (userId) => {
      const userKey = redisKeys.auth.userById(userId)
      const rawUser = await getRedisClient().get(userKey)

      if (!rawUser) {
        return null
      }

      const userDetails: RoomUsersItem = JSON.parse(rawUser)

      return {
        id: userDetails.id,
        name: userDetails.name,
      }
    })

    const usersList = await Promise.all(usersPromises)

    return usersList.filter((user): user is RoomUsersItem => user !== null) 
  }

  async removeUserFromCurrentRoom(
    userId: string,
  ): Promise<RemoveUserFromCurrentRoomResult> {
    const roomMembersKey = redisKeys.chat.userCurrentRoom(userId)
    const userCurrentRoomKey = roomMembersKey

    const rawResult = await getRedisClient().eval(
      `
        local currentRoomId = redis.call('GET', KEYS[1])

        if not currentRoomId then
          return cjson.encode({ status = 'user_not_in_room' })
        end

        local roomKey = 'chat:room:' .. currentRoomId
        local roomMembersKey = 'chat:room:' .. currentRoomId .. ':members'

        if redis.call('EXISTS', roomKey) == 0 then
          redis.call('DEL', KEYS[1])
          return cjson.encode({
            status = 'room_not_found',
            roomId = currentRoomId
          })
        end

        if redis.call('SISMEMBER', roomMembersKey, ARGV[1]) == 0 then
          redis.call('DEL', KEYS[1])
          return cjson.encode({ status = 'user_not_in_room' })
        end

        redis.call('SREM', roomMembersKey, ARGV[1])
        redis.call('DEL', KEYS[1])

        if redis.call('SCARD', roomMembersKey) == 0 then
          redis.call('SREM', KEYS[2], currentRoomId)
          redis.call('DEL', roomKey)
          redis.call('DEL', roomMembersKey)

          return cjson.encode({
            status = 'success',
            roomId = currentRoomId,
            roomDeleted = true
          })
        end

        return cjson.encode({
          status = 'success',
          roomId = currentRoomId,
          roomDeleted = false
        })
      `,
      {
        keys: [userCurrentRoomKey, 'chat:rooms'],
        arguments: [userId],
      },
    )

    return JSON.parse(String(rawResult)) as RemoveUserFromCurrentRoomResult
  }
}
