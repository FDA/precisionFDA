import { SpaceEventInput } from '../space-event.input'
import { SpaceMembership } from '../../space-membership/space-membership.entity'
import { SpaceEvent } from '../space-event.entity'
import { Space } from '../../space/space.entity'
import { User } from '../../user'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../space-event.enum'
import { BaseOperation } from '../../../utils'
import { UserOpsCtx } from '../../../types'
import { email } from '../../..'
import { SqlEntityManager } from '@mikro-orm/mysql'

const getMembership = async (input: SpaceEventInput, em: SqlEntityManager): Promise<SpaceMembership> => {
  if (!input.membership) {
    const qb = em.createQueryBuilder(SpaceMembership)
    qb.select('*')
      .where({ spaces: { id: input.spaceId } })
      .where({ user: { id: input.userId } })
      .where({ active: true })
    const memberships = await qb.execute()
    if (memberships.length > 0) {
      return memberships[0]
    }
    throw new Error(`Couldn't find membership for user ${input.userId.toString()}`)
  }
  return input.membership
}

/**
 * Returns entity type based on class name with the exception of Node's decendants
 * that have entity type 'Node'.
 */
const getEntityType = (entity: any): ENTITY_TYPE => {
  if (entity) {
    if (['UserFile', 'Asset', 'Folder'].includes(entity.constructor.name)) {
      return ENTITY_TYPE.NODE
    }
  }
  //@ts-ignore
  return ENTITY_TYPE[entity?.constructor.name]
}

const createObjectJSON = (entity: any, fields: string[]): string => {
  const obj = {}
  fields.forEach(field => {
    //@ts-ignore
    obj[field] = entity[field]
  })
  return JSON.stringify(obj)
}

const getObjectData = (entity: any): string | null => {
  if (entity) {
    switch (entity.constructor.name) {
      case 'App':
        return createObjectJSON(entity, ['title'])
      case 'Asset':
        return createObjectJSON(entity, ['name', 'uid'])
      case 'Comment':
        return createObjectJSON(entity, ['body'])
      case 'Comparison':
        return createObjectJSON(entity, ['name'])
      case 'Job':
        return createObjectJSON(entity, ['name'])
      case 'Note':
        return createObjectJSON(entity, ['title'])
      case 'UserFile':
        return createObjectJSON(entity, ['name', 'uid'])
      case 'Space':
        return createObjectJSON(entity, ['name'])
      case 'Workflow':
        return createObjectJSON(entity, ['name'])
      default:
        return null
    }
  }
  return null
}

const getObjectType = (entity: any): SPACE_EVENT_OBJECT_TYPE => {
  switch (entity?.constructor.name) {
    case 'App':
      return SPACE_EVENT_OBJECT_TYPE.APP
    case 'Asset':
      return SPACE_EVENT_OBJECT_TYPE.ASSET
    case 'Comment':
      return SPACE_EVENT_OBJECT_TYPE.COMMENT
    case 'Comparison':
      return SPACE_EVENT_OBJECT_TYPE.COMPARISON
    case 'Job':
      return SPACE_EVENT_OBJECT_TYPE.JOB
    case 'Note':
      return SPACE_EVENT_OBJECT_TYPE.NOTE
    case 'Space':
      return SPACE_EVENT_OBJECT_TYPE.SPACE
    case 'SpaceMembership':
      return SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP
    case 'Task':
      return SPACE_EVENT_OBJECT_TYPE.TASK
    case 'UserFile':
      return SPACE_EVENT_OBJECT_TYPE.FILE
    case 'Workflow':
      return SPACE_EVENT_OBJECT_TYPE.WORKFLOW
    default:
      throw new Error(`Unknown entity ${entity?.constructor.name}`)
  }
}

/**
 * Operation creates SpaceEvent and triggers sending email notification.
 */
class CreateSpaceEventOperation extends BaseOperation<UserOpsCtx, SpaceEventInput, SpaceEvent | undefined> {
  async run(input: SpaceEventInput) {
    const em = this.ctx.em
    const membership = await getMembership(input, em)

    const space = await em.findOne(Space, input.spaceId)
    const user = await em.findOne(User, this.ctx.user.id)
    if (space !== null && user !== null) {
      const spaceEvent = new SpaceEvent(user, space)
      spaceEvent.activityType = input.activityType
      spaceEvent.side = membership.side
      spaceEvent.role = membership.role
      spaceEvent.entityId = input.entity?.id
      spaceEvent.entityType = getEntityType(input.entity)
      spaceEvent.objectType = getObjectType(input.entity)

      const objectData = getObjectData(input.entity)
      spaceEvent.data = (objectData != null) ? objectData : undefined

      await em.persistAndFlush(spaceEvent)

      await new email.NotificationSendOperation(this.ctx).execute(spaceEvent)

      return spaceEvent
    }
  }
}

export { CreateSpaceEventOperation }