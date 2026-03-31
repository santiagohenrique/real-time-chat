import { WebSocket } from 'ws'
import { LeaveRoomMessage } from '../../../../protocol/messages'

export const handleLeaveRoom = (ws: WebSocket, message: LeaveRoomMessage) => {
  console.log('Cliente saiu da sala:', message.payload)
}
