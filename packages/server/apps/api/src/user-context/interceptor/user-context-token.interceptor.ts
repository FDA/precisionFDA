import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { PfdaWebSocket } from '@shared/websocket/model/pfda-web-socket'
import { Observable } from 'rxjs'

export class UserContextTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    if (context.getType() !== 'ws') {
      throw new Error(
        'User context token interceptor only supports websocket context. Extend the implementation or use a different one.',
      )
    }

    const client: PfdaWebSocket = context.switchToWs().getClient()

    return userContextStorage.run(client.pfdaUserContext, () => next.handle())
  }
}
