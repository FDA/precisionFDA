import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Param, Post } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { PropertyType } from '@shared/domain/property/property.entity'
import { PropertyService } from '@shared/domain/property/services/property.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ZodPipe } from '../validation/pipes/zod.pipe'
import { PropertiesPostReqBody, propertiesPostRequestSchema } from './properties.schemas'

@Controller('/properties')
export class PropertiesController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
  ) {}

  @HttpCode(201)
  @Post()
  async setProperty(@Body(new ZodPipe(propertiesPostRequestSchema)) body: PropertiesPostReqBody) {
    const propertyService = new PropertyService(this.em, this.user)

    return await propertyService.setProperty({
      targetId: body.targetId,
      targetType: body.targetType,
      properties: body.properties!,
    })
  }

  // fetch list of valid property key options for user and given scope.
  // CACHING THIS WOULD HELP A LOT - but also would need Cache Eviction Policy
  @Get('/:targetType/scope/:scope/keys')
  async listPropertyKeys(
    @Param('scope') scope: string,
    @Param('targetType') targetType: PropertyType,
  ) {
    const propertyService = new PropertyService(this.em, this.user)
    const res = await propertyService.getValidKeys({ scope, targetType })

    return { keys: res }
  }
}
