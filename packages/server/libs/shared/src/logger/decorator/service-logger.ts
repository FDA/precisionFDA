import { Logger } from '@nestjs/common'

/**
 * Decorator for automatically instantiating and assigning a `Logger` instance to a class property.
 * This is equivalent to defining a property in a class like `private readonly log = new Logger(MyClass.name)`,
 * but with lazy initialization on first access.
 *
 * @example
 * class MyClass {
 *   @ServiceLogger()
 *   private readonly logger: Logger;
 * }
 */
export function ServiceLogger() {
  return function (target: object, propertyKey: string | symbol): any {
    let value: Logger

    Object.defineProperty(target, propertyKey, {
      get: () => {
        if (!value) {
          value = new Logger(target.constructor.name)
        }
        return value
      },
      set: (newVal: Logger) => (value = newVal),
      enumerable: true,
      configurable: true,
    })
  }
}
