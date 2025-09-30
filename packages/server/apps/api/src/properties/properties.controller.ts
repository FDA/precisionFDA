import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { PropertyType } from '@shared/domain/property/property.entity'
import { PropertyService } from '@shared/domain/property/services/property.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { EntityScope } from '@shared/types/common'
import { SetPropertiesDTO } from '@shared/domain/property/dto/set-properties.dto'
import { SetPropertiesFacade } from '@shared/facade/property/set-properties.facade'

@UseGuards(UserContextGuard)
@Controller('/properties')
export class PropertiesController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly propertyFacade: SetPropertiesFacade,
  ) {}

  @HttpCode(201)
  @Post()
  async setProperty(@Body() properties: SetPropertiesDTO): Promise<void> {
    return await this.propertyFacade.setProperties(properties)
  }

  // fetch list of valid property key options for user and given scope.
  // CACHING THIS WOULD HELP A LOT - but also would need Cache Eviction Policy
  @Get('/:targetType/scope/:scope/keys')
  async listPropertyKeys(
    @Param('scope') scope: EntityScope,
    @Param('targetType') targetType: PropertyType,
  ): Promise<{ keys: string[] }> {
    const res = await this.propertyService.getValidKeys(scope, targetType)
    return { keys: res }
  }
}
