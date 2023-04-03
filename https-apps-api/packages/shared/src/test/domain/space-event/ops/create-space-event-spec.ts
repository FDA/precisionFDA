import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import pino from 'pino'
import { SpaceEvent, spaceEvent, User } from '../../../../domain'
import { create, db } from 'shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE }
  from 'shared/src/domain/space-membership/space-membership.enum'
import { SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE }
  from 'shared/src/domain/space-event/space-event.enum'

describe('create space event tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: types.UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
  })

  it('test create space event', async () => {
    const space = create.spacesHelper.create(em, { name: 'test' })
    await em.flush()
    const membership = create.spacesHelper.addMember(
      em,
      { user, space },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    const file = create.filesHelper.create(em, { user }, { name: 'test' })
    await em.flush()

    const op = new spaceEvent.CreateSpaceEventOperation({
      em,
      log,
      user: userCtx,
    })

    const createdEvent = await op.execute({
      spaceId: space.id,
      userId: user.id,
      activityType: SPACE_EVENT_ACTIVITY_TYPE.file_added,
      entity: file,
    })
    em.clear()
    const loadedEvent = await em.findOne(SpaceEvent, { id: createdEvent.id })

    expect(loadedEvent?.activityType).to.equal(SPACE_EVENT_ACTIVITY_TYPE.file_added)
    expect(loadedEvent?.data).to.contain('{"name":"test","uid":"file')
    expect(loadedEvent?.entityType).to.equal('Node')
    expect(loadedEvent?.objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.FILE)
    expect(loadedEvent?.role).to.equal(SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR)
    expect(loadedEvent?.side).to.equal(SPACE_MEMBERSHIP_SIDE.HOST)
  })
})
