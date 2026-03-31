import { RawData } from 'ws'
import { WebSocketClientEventEnum } from './client-events'
import { WsMessage } from './messages'

type ParseMessageResult = {
  status: boolean
  message: WsMessage | null
}

export const parseMessage = (data: RawData): ParseMessageResult => {
  try {
    const rawText = data.toString()
    const rawData: unknown = JSON.parse(rawText)
    if (
      typeof rawData !== 'object' ||
      rawData === null ||
      Array.isArray(rawData)
    ) {
      throw new Error('Message is not a valid object')
    }

    const obj = rawData as Record<string, unknown>

    const { type, payload } = obj as {
      type: unknown
      payload: unknown
    }

    if (
      !('payload' in obj) ||
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new Error('Message payload is missing or invalid')
    }

    if (
      typeof type !== 'string' ||
      !Object.values(WebSocketClientEventEnum).includes(
        type as WebSocketClientEventEnum
      )
    ) {
      throw new Error('Invalid message type')
    }

    const message: WsMessage = {
      type: type as WebSocketClientEventEnum,
      payload,
    }

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
