export enum WebSocketServerEventEnum {
  USER_CREATED_ROOM = 'userCreatedRoom',
  USER_JOINED_ROOM = 'userJoinedRoom',
  USER_ALREADY_IN_ROOM = 'userAlreadyInRoom',
  USER_LEFT_ROOM = 'user_left_room',
  USER_NOT_IN_ROOM = 'userNotInRoom',
  ROOM_NOT_FOUND = 'roomNotFound',
  LIST_ROOMS_RESULT = 'listRoomsResult',
  LIST_ROOM_USERS_RESULT = 'listRoomUsersResult',
  INVALID_PAYLOAD = 'invalid_payload',
  INVALID_SCHEMA = 'invalid_schema',
}
