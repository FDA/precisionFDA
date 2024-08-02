import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { Encryptor } from '@shared/utils/encryptor'
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
    const token = client.PFDA_AUTH_TOKEN

    const decrypted = Encryptor.decrypt(token)
    const userContext = new UserContext(decrypted.user_id, decrypted.token, decrypted.username)

    return userContextStorage.run(userContext, () => next.handle())
  }
}
