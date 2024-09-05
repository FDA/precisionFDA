import { Injectable, NestMiddleware } from '@nestjs/common'
import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { userContextStorage } from '@shared/domain/user-context/storage/user-context.storage'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = req.headers[USER_CONTEXT_HTTP_HEADERS.id]

    const userContext = new UserContext(
      id ? parseInt(id.toString(), 10) : null,
      req.headers[USER_CONTEXT_HTTP_HEADERS.accessToken] as string,
      req.headers[USER_CONTEXT_HTTP_HEADERS.dxUser] as string,
    )

    userContextStorage.run(userContext, next)
  }
}
