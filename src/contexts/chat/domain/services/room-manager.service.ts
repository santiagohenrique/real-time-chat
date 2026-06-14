import { randomUUID } from "node:crypto";
import { RoomStore } from "./redis-room.store";
import { Room } from "../entities/room";

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
    await this.roomStore.addUserToRoom(input.roomId, input.userId)
  }

  async listAvailableRoomsUseCase() {
    return await this.roomStore.listAvailableRooms()
  }

  async listUsersInAroomUseCase() {
    return await this.roomStore.listAvailableRooms()
  }
}