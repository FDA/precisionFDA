import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { CreateSpaceEventOperation } from '@shared/domain/space-event/ops/create-space-event'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { spaceEvent } from '@shared/test/generate'
import { expect } from 'chai'
import pino from 'pino'
import { create, db } from '../../../src/test'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE }
  from '../../../src/domain/space-membership/space-membership.enum'
import { SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE }
  from '../../../src/domain/space-event/space-event.enum'
import { ENTITY_TYPE } from '../../../src/domain/space-event/space-event.enum'
import { InputEntityUnion } from '../../../src/utils/object-utils'

describe('create space event tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: UserCtx
  let op: CreateSpaceEventOperation

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
  })

  it('test create space event', async () => {
    const space = create.spacesHelper.create(em, { name: 'test' })
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user, space },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    const file = create.filesHelper.create(em, { user }, { name: 'test' })
    await em.flush()

    op = new CreateSpaceEventOperation({
      em,
      log,
      user: userCtx,
    })

    const createdEvent = await op.execute({
      spaceId: space.id,
      userId: user.id,
      activityType: SPACE_EVENT_ACTIVITY_TYPE.file_added,
      entity: {
        type: 'userFile',
        value: file,
      },
    })
    em.clear()

    expect(createdEvent).not.to.equal(undefined)

    const loadedEvent = await em.findOne(SpaceEvent, { id: createdEvent?.id })

    expect(loadedEvent?.activityType).to.equal(SPACE_EVENT_ACTIVITY_TYPE.file_added)
    expect(loadedEvent?.data).to.contain('{"name":"test","uid":"file')
    expect(loadedEvent?.entityType).to.equal('Node')
    expect(loadedEvent?.objectType).to.equal(SPACE_EVENT_OBJECT_TYPE.FILE)
    expect(loadedEvent?.role).to.equal(SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR)
    expect(loadedEvent?.side).to.equal(SPACE_MEMBERSHIP_SIDE.HOST)
  })

  const createAndVerify = async (space: Space, entity: InputEntityUnion,
                                 activityType: SPACE_EVENT_ACTIVITY_TYPE,
                                 entityType: ENTITY_TYPE,
                                 objectType: SPACE_EVENT_OBJECT_TYPE,
                                 data: string) => {
    op = new CreateSpaceEventOperation({
      em,
      log,
      user: userCtx,
    })

    const createdEvent = await op.execute({
      spaceId: space.id,
      userId: user.id,
      activityType: activityType,
      entity,
    })
    em.clear()

    expect(createdEvent).not.to.equal(undefined)

    const loadedEvent = await em.findOne(SpaceEvent, {id: createdEvent?.id})

    expect(loadedEvent?.activityType).to.equal(activityType)
    expect(loadedEvent?.entityType).to.equal(entityType)
    expect(loadedEvent?.objectType).to.equal(objectType)
    expect(loadedEvent?.data).to.equal(data)
    expect(loadedEvent?.user.id).to.equal(user.id)
    expect(loadedEvent?.space.id).to.equal(space.id)
  }

  it('test create space event with correct object and entity type', async () => {
    const space = create.spacesHelper.create(em, { name: 'test' })
    await em.flush()
    const membership = create.spacesHelper.addMember(
      em,
      { user, space },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    const job = create.jobHelper.create(em, { user }, { name: 'test' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app-title'} )
    const file = create.filesHelper.create(em, { user }, { name: 'test' })
    const asset = create.assetHelper.create(em, { user }, { name: 'test' })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'test' })
    const comment = create.commentHelper.create(em, { user }, { body: 'body' })
    const comparison = create.comparisonHelper.create(em, { app, user }, { name: 'test' })
    const note = create.noteHelper.create(em, { user }, { content: 'body' })
    const workflow = create.workflowHelper.create(em, { user }, { name: 'test' })
    await em.flush()

    await createAndVerify(space, { type: 'app', value: app },
      SPACE_EVENT_ACTIVITY_TYPE.app_added, ENTITY_TYPE.APP, SPACE_EVENT_OBJECT_TYPE.APP,
      `{"title":"${app.title}"}`)
    await createAndVerify(space, { type: 'userFile', value: file },
      SPACE_EVENT_ACTIVITY_TYPE.file_added, ENTITY_TYPE.NODE, SPACE_EVENT_OBJECT_TYPE.FILE,
      `{"name":"${file.name}","uid":"${file.uid}"}`)
    await createAndVerify(space, { type: 'asset', value: asset },
      SPACE_EVENT_ACTIVITY_TYPE.asset_added, ENTITY_TYPE.NODE, SPACE_EVENT_OBJECT_TYPE.ASSET,
      `{"name":"${asset.name}","uid":"${asset.uid}"}`)
    await createAndVerify(space, { type: 'folder', value: folder },
      SPACE_EVENT_ACTIVITY_TYPE.file_added, ENTITY_TYPE.NODE, SPACE_EVENT_OBJECT_TYPE.FILE,
      `{"name":"${folder.name}"}`)
    await createAndVerify(space, { type: 'comment', value: comment },
      SPACE_EVENT_ACTIVITY_TYPE.comment_added, ENTITY_TYPE.COMMENT, SPACE_EVENT_OBJECT_TYPE.COMMENT,
      `{"body":"${comment.body}"}`)
    await createAndVerify(space, { type: 'comparison', value: comparison },
      SPACE_EVENT_ACTIVITY_TYPE.comparison_added, ENTITY_TYPE.COMPARISON, SPACE_EVENT_OBJECT_TYPE.COMPARISON,
      `{"name":"${comparison.name}"}`)
    await createAndVerify(space, { type: 'job', value: job },
      SPACE_EVENT_ACTIVITY_TYPE.job_added, ENTITY_TYPE.JOB, SPACE_EVENT_OBJECT_TYPE.JOB,
      `{"name":"${job.name}"}`)
    await createAndVerify(space, { type: 'note', value: note },
      SPACE_EVENT_ACTIVITY_TYPE.note_added, ENTITY_TYPE.NOTE, SPACE_EVENT_OBJECT_TYPE.NOTE,
      `{"title":"${note.title}"}`)
    await createAndVerify(space, { type: 'space', value: space },
      SPACE_EVENT_ACTIVITY_TYPE.space_activated, ENTITY_TYPE.SPACE, SPACE_EVENT_OBJECT_TYPE.SPACE,
      `{"name":"${space.name}"}`)
    await createAndVerify(space, { type: 'workflow', value: workflow },
      SPACE_EVENT_ACTIVITY_TYPE.workflow_added, ENTITY_TYPE.WORKFLOW, SPACE_EVENT_OBJECT_TYPE.WORKFLOW,
      `{"name":"${workflow.name}"}`)
    await createAndVerify(space, { type: 'spaceMembership', value: membership },
      SPACE_EVENT_ACTIVITY_TYPE.space_activated, ENTITY_TYPE.SPACE_MEMBERSHIP, SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      `{"role":${membership.role},"side":${membership.side}}`)
  })

})
