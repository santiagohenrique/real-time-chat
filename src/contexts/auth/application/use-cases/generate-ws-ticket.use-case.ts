import { WsTicketSession, WsTicketStore } from '../../ws-ticket.store';

export class GenerateWsTicketUseCase {
  constructor(private readonly wsTicketStore: WsTicketStore){}

  async execute(session: WsTicketSession){
    return this.wsTicketStore.issue(session)
  }
}