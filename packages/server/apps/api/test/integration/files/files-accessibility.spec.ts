import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { create, db } from '@shared/test'
import { testedApp } from '../..'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('GET /files/accessibility', () => {
  let em: SqlEntityManager
  let user: User
  let space: Space
  let anotherSpace: Space
  let user2: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as SqlEntityManager
    em.clear()
    user = create.userHelper.create(em)
    create.sessionHelper.create(em, { user })
    space = create.spacesHelper.create(em, {})
    create.spacesHelper.addMember(
      em,
      { space, user },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    anotherSpace = create.spacesHelper.create(em, {})
    user2 = create.userHelper.create(em)
    create.spacesHelper.addMember(
      em,
      { space: anotherSpace, user: user2 },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    await em.flush()
  })

  it('should validate that files are accessible to the user', async () => {
    const invalidUid = 'file-invalid-1'
    const file = create.filesHelper.createUploaded(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    const fileInSpace = create.filesHelper.createUploaded(em, { user }, { scope: space.scope })
    await em.flush()
    const folder = create.filesHelper.createFolder(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    await em.flush()
    const fileInFolder = create.filesHelper.createUploaded(
      em,
      { user },
      { parentFolder: folder, scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()

    const fileInAnotherSpace = create.filesHelper.createUploaded(em, { user: user2 }, { scope: anotherSpace.scope })
    const { body } = await supertest(testedApp.getHttpServer())
      .get(
        `/files/accessibility?uids=${file.uid}&uids=${fileInFolder.uid}&uids=${fileInSpace.uid}&uids=${fileInAnotherSpace.uid}&uids=${invalidUid}`,
      )
      .set(getDefaultHeaderData(user))
      .expect(200)
    expect(body).to.deep.equal({
      invalid: [fileInAnotherSpace.uid, invalidUid],
      valid: [file.uid, fileInFolder.uid, fileInSpace.uid],
    })
  })
})
