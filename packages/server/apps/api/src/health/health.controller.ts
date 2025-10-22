// health.controller.ts
import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: 'ok' }
  }
}
