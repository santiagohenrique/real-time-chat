import { RawData } from 'ws'
import { WsMessage } from './messages'
import { messagePayloadSchema } from './schemas/zod/message-payload.schema'

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
    throw error
  }
}
