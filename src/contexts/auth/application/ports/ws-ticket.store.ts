export type WsTicketSession = {
  userId: string
  name: string
}

export interface WsTicketStore {
  issue(session: WsTicketSession): Promise<string>
  consume(ticket: string): Promise<WsTicketSession | null>
}