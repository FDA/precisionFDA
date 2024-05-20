import { WsAdapter } from '@nestjs/platform-ws'
import { Server } from 'ws'

export class WebsocketAdapter extends WsAdapter {
  close(server: Server): Promise<void> {
    const close = super.close(server)
    server.clients.forEach((c) => c.close())

    return close
  }
}
