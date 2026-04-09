import { EntityRepository } from '@mikro-orm/core'
import { GeneralProperty } from '@shared/domain/property/property.entity'

export class PropertyRepository extends EntityRepository<GeneralProperty> {}
