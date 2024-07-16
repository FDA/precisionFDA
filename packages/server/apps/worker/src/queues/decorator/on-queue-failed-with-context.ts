import { CreateRequestContext } from '@mikro-orm/core'
import { OnQueueFailed } from '@nestjs/bull'

export function OnQueueFailedWithContext(): MethodDecorator {
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    CreateRequestContext()(target, propertyKey, descriptor)
    OnQueueFailed()(target, propertyKey, descriptor)
  }
}
