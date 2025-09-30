import { GeneralProperty } from '@shared/domain/property/property.entity'
import { EntityRepository } from '@mikro-orm/core'

export class PropertyRepository extends EntityRepository<GeneralProperty> {}
