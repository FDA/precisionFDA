import { CreateRequestContext } from '@mikro-orm/core'
import { Process } from '@nestjs/bull'
import { database } from '@shared/database'

export function ProcessWithContext(jobName: string): MethodDecorator {
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    CreateRequestContext(() => database.orm())(target, propertyKey, descriptor)
    Process(jobName)(target, propertyKey, descriptor)
  }
}
