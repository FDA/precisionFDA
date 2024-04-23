import { CreateRequestContext } from '@mikro-orm/core'
import { SubscribeMessage } from '@nestjs/websockets'
import { database } from '@shared/database'

export function SubscribeMessageWithContext(eventName: string): MethodDecorator {
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    CreateRequestContext(() => database.orm())(target, propertyKey, descriptor)
    SubscribeMessage(eventName)(target, propertyKey, descriptor)
  }
}
