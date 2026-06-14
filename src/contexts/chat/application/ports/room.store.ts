import { Room } from "../../domain/entities/room"
import { RoomListItem } from "../dtos/rooms.dto"

export type AddUserToRoomResult =
  | { status: 'joined' }
  | { status: 'room_not_found' }
  | { status: 'already_in_room'; roomId: string }

export interface RoomStore {
  createRoom(room: Room): Promise<void>
  addUserToRoom(roomId: string, userId: string): Promise<AddUserToRoomResult>
  listRooms(): Promise<RoomListItem[]>
}
