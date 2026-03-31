import { RawData } from 'ws'
import { WsMessage } from './messages'
import { messagePayloadSchema } from './schemas/message-payload'

type ParseMessageResult = {
  status: boolean
  message: WsMessage | null
}

export const parseMessage = (data: RawData): ParseMessageResult => {
  try {
    const rawText = data.toString()
    const rawData: unknown = JSON.parse(rawText)

    const message = messagePayloadSchema.parse(rawData)

    return {
      status: true,
      message,
    }
  } catch (error) {
    console.error('Error parsing message:', error)
    return {
      status: false,
      message: null,
    }
  }
}
