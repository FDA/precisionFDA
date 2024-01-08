import { Provider, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { UserContext } from '@shared/domain/user-context/model/user-context'

export const userContextProvider: Provider = {
  provide: UserContext,
  useFactory: (request: Request) => {
    const id = request.headers[USER_CONTEXT_HTTP_HEADERS.id]

    return new UserContext(
      id ? parseInt(id.toString(), 10) : null,
      request.headers[USER_CONTEXT_HTTP_HEADERS.accessToken],
      request.headers[USER_CONTEXT_HTTP_HEADERS.dxUser],
    )
  },
  inject: [REQUEST],
  scope: Scope.REQUEST,
}
