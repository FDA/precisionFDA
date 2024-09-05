import { RequestContext } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class OrmContextInterceptor implements NestInterceptor {
  constructor(private readonly em: SqlEntityManager) {}

  intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<void>> {
    return RequestContext.create(this.em, async () => next.handle())
  }
}
