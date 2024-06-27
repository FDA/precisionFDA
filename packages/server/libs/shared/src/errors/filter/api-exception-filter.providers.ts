import { Provider } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { BaseErrorExceptionFilter } from '@shared/errors/filter/base-error-exception.filter'
import { DefaultExceptionFilter } from '@shared/errors/filter/default-exception.filter'
import { HttpExceptionFilter } from '@shared/errors/filter/http-exception.filter'

export const apiExceptionFilterProviders: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: DefaultExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: BaseErrorExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
]
