export enum WebSocketServerEventEnum {
  USER_CREATED_ROOM = 'userCreatedRoom',
  USER_JOINED_ROOM = 'userJoinedRoom',
  USER_ALREADY_IN_ROOM = 'userAlreadyInRoom',
  USER_LEFT_ROOM = 'user_left_room',
  ROOM_NOT_FOUND = 'roomNotFound',
  SHOW_ROOMS = 'showRooms',
  INVALID_PAYLOAD = 'invalid_payload',
  INVALID_SCHEMA = 'invalid_schema',
}
