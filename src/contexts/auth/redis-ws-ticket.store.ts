import { randomBytes } from "node:crypto";
import { KeyValueStore } from "../../infra/key-value.store";
import { WsTicketSession, WsTicketStore } from "./ws-ticket.store";

export class RedisWsTicketStore implements WsTicketStore {
  constructor(private readonly keyValueStore: KeyValueStore) {}

  async issue(session: WsTicketSession): Promise<string> {
    const wsTicket = randomBytes(32).toString('base64url')
    const authKey = `ws:auth:${wsTicket}`

    const result: boolean = await this.keyValueStore.setIfNotExists(
      authKey,
      JSON.stringify(session),
      {
        ttlInSeconds: 15
      }
    )

    if(!result) {
      throw new Error('Error generating ws ticket')
    }

    return wsTicket
  }

  async consume(ticket: string): Promise<WsTicketSession | null> {
    const authKey = `ws:auth:${ticket}`
    const value = await this.keyValueStore.getDel(authKey)

    if (value === null) {
      return null
    }

    return JSON.parse(value) as WsTicketSession
  }
}