import { CreateRequestContext } from '@mikro-orm/core'
import { Process } from '@nestjs/bull'
import { database } from '@shared/database'
import { ProcessInUserContext } from '@shared/domain/user-context/decorator/process-with-user-context'

export function ProcessWithContext(jobName: string): MethodDecorator {
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    ProcessInUserContext(descriptor)
    CreateRequestContext(() => database.orm())(target, propertyKey, descriptor)
    Process(jobName)(target, propertyKey, descriptor)
  }
}
