import { EntityRepository } from '@mikro-orm/mysql'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'

export class SpaceEventRepository extends EntityRepository<SpaceEvent> {}
