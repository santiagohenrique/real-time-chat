import { randomUUID } from "node:crypto";
import { RoomStore } from "../../application/ports/room.store";
import { Room } from "../entities/room";
import { RoomNotFoundError } from "../room-not-found.error";

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
    const joined = await this.roomStore.addUserToRoom(
      input.roomId,
      input.userId,
    )

    if (!joined) {
      throw new RoomNotFoundError(input.roomId)
    }
  }

  async listRoomsUseCase() {
    return await this.roomStore.listRooms()
  }
}
