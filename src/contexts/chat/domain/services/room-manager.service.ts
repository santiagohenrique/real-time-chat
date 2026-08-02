import { randomUUID } from "node:crypto";
import { RoomStore } from "../../application/ports/room.store";
import { Room } from "../entities/room";
import { RoomNotFoundError } from "../room-not-found.error";
import { UserAlreadyInRoomError } from "../user-already-in-room.error";
import { UserNotInRoomError } from "../user-not-in-room.error";

export class RoomManagerService {
  constructor(private readonly roomStore: RoomStore) {}

  async createRoomUseCase(
    input: {
      roomName: string
    }
  ) {
    const { roomName } = input
    const uuid = randomUUID()
    const room = new Room(
      uuid,
      roomName
    )
    
    await this.roomStore.createRoom(room)
    return room
  }

  async joinRoomUseCase(
    input: { 
      roomId: string;
      userId: string 
    }
  ) {
    const joinResult = await this.roomStore.addUserToRoom(
      input.roomId,
      input.userId,
    )

    if (joinResult.status === 'room_not_found') {
      throw new RoomNotFoundError(input.roomId)
    }

    if (joinResult.status === 'already_in_room') {
      throw new UserAlreadyInRoomError(joinResult.roomId)
    }
  }

  async listRoomsUseCase() {
    return await this.roomStore.listRooms()
  }

  async listRoomUsersUseCase(
    input: { 
      roomId: string;
    }
  ) {
    const { roomId } = input
    const roomExists = await this.roomStore.roomExists(roomId)

    if(!roomExists) {
      throw new RoomNotFoundError(roomId) 
    }
    
    return await this.roomStore.listRoomUsers(roomId)
  }

  async leaveRoomUseCase(userId: string) {
    const removeResult = await this.roomStore.removeUserFromCurrentRoom(userId)

    if (removeResult.status === 'room_not_found') {
      throw new RoomNotFoundError(removeResult.roomId)
    }

    if (removeResult.status === 'user_not_in_room') {
      throw new UserNotInRoomError()
    }

    return removeResult
  }
}
