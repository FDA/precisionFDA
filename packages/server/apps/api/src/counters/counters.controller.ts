import { Controller, Get, UseGuards } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { CountersFacade } from '@shared/facade/counters/counters.facade'
import { CountersResponse } from '@shared/domain/counters/counters.types'
import { HOME_SCOPE } from '@shared/enums'

@UseGuards(UserContextGuard)
@Controller('/counters')
export class CountersController {
  constructor(private readonly countersFacade: CountersFacade) {}

  /**
   * GET /api/v2/counters
   * Returns counters for the 'me' (private) scope
   */
  @Get()
  async getCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.ME)
  }

  /**
   * GET /api/v2/counters/featured
   * Returns counters for the featured scope
   */
  @Get('/featured')
  async getFeaturedCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.FEATURED)
  }

  /**
   * GET /api/v2/counters/everybody
   * Returns counters for the everybody (public) scope
   */
  @Get('/everybody')
  async getEverybodyCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.EVERYBODY)
  }

  /**
   * GET /api/v2/counters/spaces
   * Returns counters for the spaces scope
   */
  @Get('/spaces')
  async getSpacesCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.SPACES)
  }
}
