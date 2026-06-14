import { Room } from "../../domain/entities/room"
import { RoomListItem } from "../dtos/rooms.dto"

export interface RoomStore {
  createRoom(room: Room): Promise<void>
  addUserToRoom(roomId: string, userId: string): Promise<boolean>
  listRooms(): Promise<RoomListItem[]>
}
