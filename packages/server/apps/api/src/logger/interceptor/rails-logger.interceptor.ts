/**
 * Generates logs in the exact same format as the Rails part of PFDA.
 * Helps with easier log analysis.
 * Using console.log directly to avoid any formatting.
 */

import { STATUS_CODES } from 'node:http'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { catchError, Observable, tap } from 'rxjs'
import { config } from '@shared/config'
import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { BaseError } from '@shared/errors'
import { TimeUtils } from '@shared/utils/time.utils'

@Injectable()
export class RailsLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()

    const userAgent = request.headers[USER_CONTEXT_HTTP_HEADERS.userAgent]
    if (userAgent === 'Ruby') {
      return next.handle()
    }

    const startDate = new Date()
    const method = request.method
    const url = request.url
    const clientIp = request.headers[config.api.nginxIpHeader]
    const pid = process.pid
    const atTime = TimeUtils.formatAtTime(startDate)

    this.logMessage(startDate, pid, request.id, `Started ${method} "${url}" for ${clientIp} at ${atTime}`)

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse()
        const statusCode = response.statusCode
        const statusText = STATUS_CODES[statusCode] || ''
        const responseTime = Date.now() - startDate.getTime()

        this.logMessage(new Date(), pid, request.id, `Completed ${statusCode} ${statusText} in ${responseTime}ms`)
      }),
      catchError((error: Error) => {
        const statusCode = error instanceof BaseError ? error.props.statusCode : 500
        const statusText = STATUS_CODES[statusCode] || ''
        const responseTime = Date.now() - startDate.getTime()
        this.logMessage(new Date(), pid, request.id, `Completed ${statusCode} ${statusText} in ${responseTime}ms`)
        throw error
      }),
    )
  }

  private logMessage(time: Date, pid: number, reqId: string, message: string): void {
    console.log(`I, [${TimeUtils.formatTimestamp(time)} #${pid}]  INFO -- : ${message}. requestId: ${reqId}`)
  }
}
