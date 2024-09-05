import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { EntityRepository } from '@mikro-orm/mysql'

export class SpaceEventRepository extends EntityRepository<SpaceEvent> {}
