import { WebSocket } from 'ws'
import { LeaveRoomMessage } from '../../../../../protocol/messages'

export const handleLeaveRoom = (ws: WebSocket, message: LeaveRoomMessage) => {
  try {

  } catch(error) {
    console.error('Error handling join room:', error)
  }
}
