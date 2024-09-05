import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { CreatePropertyDTO } from '@shared/domain/property/dto/CreatePropertyDTO'
import { PropertyType } from '@shared/domain/property/property.entity'
import { PropertyService } from '@shared/domain/property/services/property.service'

@Controller('/properties')
export class PropertiesController {
  constructor(
    private readonly propertyService: PropertyService,
  ) {}

  @HttpCode(201)
  @Post()
  async setProperty(@Body() properties: CreatePropertyDTO) {
    return await this.propertyService.setProperty(properties)
  }

  // fetch list of valid property key options for user and given scope.
  // CACHING THIS WOULD HELP A LOT - but also would need Cache Eviction Policy
  @Get('/:targetType/scope/:scope/keys')
  async listPropertyKeys(
    @Param('scope') scope: string,
    @Param('targetType') targetType: PropertyType,
  ) {
    const res = await this.propertyService.getValidKeys(scope, targetType)
    return { keys: res }
  }
}
