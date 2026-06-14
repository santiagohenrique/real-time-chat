import { randomUUID } from "node:crypto";
import { RoomStore } from "../../application/ports/room.store";
import { Room } from "../entities/room";
import { RoomNotFoundError } from "../room-not-found.error";
import { UserAlreadyInRoomError } from "../user-already-in-room.error";

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
}
