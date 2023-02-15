import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { Asset, Comparison, Job, User } from '@pfda/https-apps-shared/src/domain'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { findParentEntity } from '@pfda/https-apps-shared/src/domain/user-file/provenance'
import { PARENT_TYPE } from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'

describe('Provenance tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  const userId = 100

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em, { id: userId })
    await em.flush()
  })

  it('findParentEntity finds User parent', async () => {
    const file = create.filesHelper.createUploaded(em, { user }, { id: 123, name: 'file1' })
    await em.flush()

    const parent = await findParentEntity(em, file)
    expect(parent instanceof User).to.equal(true)
    const parentUser = parent as any
    expect(parentUser.id).to.equal(userId)
    expect(parentUser.dxuser).to.equal(user.dxuser)
  })

  it('findParentEntity finds Asset parent', async () => {
    const asset = create.filesHelper.createUploadedAsset(em, { user }, { id: 123, name: 'Asset 1' })
    await em.flush()
    const file = create.filesHelper.create(em, { user }, { name: 'file4', parentType: PARENT_TYPE.ASSET, parentId: asset.id })
    await em.flush()

    const parent = await findParentEntity(em, file)
    expect(parent instanceof Asset).to.equal(true)
    const parentAsset = parent as any
    expect(parentAsset.id).to.equal(123)
    expect(parentAsset.name).to.equal('Asset 1')
  })

  it('findParentEntity finds Job parent', async () => {
    const job = create.jobHelper.create(em, { user }, { id: 123, name: 'Job 1' })
    await em.flush()
    const file = create.filesHelper.createJobOutput(em, { user, jobId: job.id }, { name: 'file2' })
    await em.flush()

    const parent = await findParentEntity(em, file)
    expect(parent instanceof Job).to.equal(true)
    const parentJob = parent as any
    expect(parentJob.id).to.equal(123)
    expect(parentJob.name).to.equal('Job 1')
  })

  it('findParentEntity finds Comparison parent', async () => {
    const app = create.appHelper.createRegular(em, { user })
    const comparison = create.comparisonHelper.create(em, { user, app }, { id: 123, name: 'Comparison 1' })
    await em.flush()
    const file = create.filesHelper.createComparisonOutput(em, { user, comparisonId: comparison.id }, { name: 'file3' })
    await em.flush()

    const parent = await findParentEntity(em, file)
    expect(parent instanceof Comparison).to.equal(true)
    const parentComparison = parent as any
    expect(parentComparison.id).to.equal(123)
    expect(parentComparison.name).to.equal('Comparison 1')
  })
})
