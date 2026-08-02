export const redisKeys = {
  auth: {
    userById: (userId: string) => `user:${userId}`,
    userByName: (normalizedName: string) => `user:name:${normalizedName}`,
    wsTicket: (ticket: string) => `ws:auth:${ticket}`,
  },
  chat: {
    rooms: () => 'chat:rooms',
    roomPrefix: () => 'chat:room:',
    roomById: (roomId: string) => `chat:room:${roomId}`,
    roomMembersSuffix: () => ':members',
    roomMembers: (roomId: string) => `chat:room:${roomId}:members`,
    userCurrentRoom: (userId: string) => `chat:user:${userId}:current-room`,
  },
}
