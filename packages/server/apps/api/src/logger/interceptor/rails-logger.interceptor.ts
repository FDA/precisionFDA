/**
 * Generates logs in the exact same format as the Rails part of PFDA.
 * Helps with easier log analysis.
 * Using console.log directly to avoid any formatting.
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { config } from '@shared/config'
import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { STATUS_CODES } from 'http'
import { Observable, tap } from 'rxjs'

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
    const atTime = this.formatAtTime(startDate)

    this.logMessage(
      startDate,
      pid,
      request.id,
      `Started ${method} "${url}" for ${clientIp} at ${atTime}`,
    )

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse()
        const statusCode = response.statusCode
        const statusText = STATUS_CODES[statusCode] || ''
        const responseTime = Date.now() - startDate.getTime()

        this.logMessage(
          new Date(),
          pid,
          request.id,
          `Completed ${statusCode} ${statusText} in ${responseTime}ms`,
        )
      }),
    )
  }

  private logMessage(time: Date, pid: number, reqId: string, message: string) {
    console.log(
      `I, [${this.formatTimestamp(time)} #${pid}]  INFO -- : ${message}. requestId: ${reqId}`,
    )
  }

  private formatTimestamp(date: Date): string {
    const { year, month, day, hours, minutes, seconds, milliseconds, microseconds } =
      this.getFormattedTimeSections(date)

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${microseconds}`
  }

  private formatAtTime(date: Date): string {
    const { year, month, day, hours, minutes, seconds } = this.getFormattedTimeSections(date)

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0000`
  }

  private getFormattedTimeSections(date: Date) {
    return {
      year: date.getFullYear(),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      day: String(date.getDate()).padStart(2, '0'),
      hours: String(date.getHours()).padStart(2, '0'),
      minutes: String(date.getMinutes()).padStart(2, '0'),
      seconds: String(date.getSeconds()).padStart(2, '0'),
      milliseconds: String(date.getMilliseconds()).padStart(3, '0'),
      // Timestamp in the RoR logs includes microseconds
      microseconds: '000',
    }
  }
}
