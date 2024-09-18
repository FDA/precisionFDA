import { CreateRequestContext } from '@mikro-orm/core'
import { OnQueueFailed } from '@nestjs/bull'
import { database } from '@shared/database'

export function OnQueueFailedWithContext(): MethodDecorator {
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    CreateRequestContext(() => database.orm())(target, propertyKey, descriptor)
    OnQueueFailed()(target, propertyKey, descriptor)
  }
}
