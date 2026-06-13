import { RoomStore } from "./redis-room.store";

export class RoomManagerService {
  constructor(private readonly roomStore: RoomStore) {}

  async joinRoomUseCase(input: { roomName: string; userId: string }) {
    await this.roomStore.createRoom(input.roomName)
    await this.roomStore.addUserToRoom(input.roomName, input.userId)
  }

  async listAvailableRoomsUseCase() {
    return await this.roomStore.listAvailableRooms()
  }
}