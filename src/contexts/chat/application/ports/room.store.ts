import { Room } from "../../domain/entities/room"
import { RoomUsersItem } from "../dtos/room-users.dto";
import { RoomListItem } from "../dtos/rooms.dto"

export type AddUserToRoomResult =
  | { status: 'success' }
  | { status: 'room_not_found' }
  | { status: 'already_in_room'; roomId: string }

export type RemoveUserFromCurrentRoomResult =
  | { status: 'success'; roomId: string; roomDeleted: boolean }
  | { status: 'room_not_found'; roomId: string }
  | { status: 'user_not_in_room' }

export interface RoomStore {
  createRoom(room: Room): Promise<void>
  addUserToRoom(roomId: string, userId: string): Promise<AddUserToRoomResult>
  listRooms(): Promise<RoomListItem[]>
  listRoomUsers(roomId: string): Promise<RoomUsersItem[]>
  removeUserFromCurrentRoom(userId: string): Promise<RemoveUserFromCurrentRoomResult>
}
