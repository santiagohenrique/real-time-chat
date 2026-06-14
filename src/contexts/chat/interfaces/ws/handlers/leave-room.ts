import { WebSocket } from 'ws'
import { LeaveRoomMessage } from '../../../../../protocol/messages'

export const handleLeaveRoom = (_ws: WebSocket, _message: LeaveRoomMessage) => {
  console.warn('leave_room not implemented yet')
}
