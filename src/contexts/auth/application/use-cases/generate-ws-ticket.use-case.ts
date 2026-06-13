import { WsTicketSession, WsTicketStore } from '../ports/ws-ticket.store';

export class GenerateWsTicketUseCase {
  constructor(private readonly wsTicketStore: WsTicketStore){}

  async execute(session: WsTicketSession){
    return this.wsTicketStore.issue(session)
  }
}