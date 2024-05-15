/* eslint-disable max-len */
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import { database } from '../../../src/database'

describe('FolderRepository tests', () => {
  let em: EntityManager<MySqlDriver>
  let user1: User
  let user2: User
  let httpsApp: App
  let httpsJob1: Job
  let httpsJob2: Job
  let folders: Folder[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)

    httpsApp = create.appHelper.createHTTPS(em, { user: user1 })
    httpsJob1 = create.jobHelper.create(em, { user: user1, app: httpsApp })
    httpsJob2 = create.jobHelper.create(em, { user: user2, app: httpsApp })
    await em.flush()

    folders = []

    // Create a file tree for two users for testing
    folders.push(
      create.filesHelper.createFolder(
        em,
        { user: user1 },
        {
          name: 'user1_folder1',
          project: user1.privateFilesProject,
          parentId: httpsJob1.id,
          parentType: PARENT_TYPE.JOB,
        },
      ),
    )
    folders.push(create.filesHelper.createFolder(em, { user: user1 }, { name: 'user1_folder2' }))

    folders.push(create.filesHelper.createFolder(em, { user: user2 }, { name: 'user2_folder1' }))
    folders.push(
      create.filesHelper.createFolder(
        em,
        { user: user2 },
        {
          name: 'user2_folder2',
          project: user2.privateFilesProject,
          parentId: httpsJob2.id,
          parentType: PARENT_TYPE.JOB,
        },
      ),
    )
    await em.flush()
  })

  it('findForUser', async () => {
    const repo = em.getRepository(Folder)
    let result1 = await repo.findForUser({ userId: user1.id })
    expect(result1).to.have.length(2)
    expect(result1[0].name).to.equal('user1_folder1')
    expect(result1[1].name).to.equal('user1_folder2')

    let result2 = await repo.findForUser({ userId: user2.id })
    expect(result2).to.have.length(2)
    expect(result2[0].name).to.equal('user2_folder1')
    expect(result2[1].name).to.equal('user2_folder2')
  })

  it('findAllPFDAOnlyFolders', async () => {
    const repo = em.getRepository(Folder)
    const results = await repo.findAllPFDAOnlyFolders()
    expect(results[0].isPFDAOnly()).to.be.true()
    expect(results[1].isPFDAOnly()).to.be.true()
    const names = results.map((x) => x.name)
    expect(names).to.deep.equal(['user1_folder2', 'user2_folder1'])
  })

  it('findPFDAOnlyFoldersForUser', async () => {
    const repo = em.getRepository(Folder)
    const results = await repo.findPFDAOnlyFoldersForUser({ userId: user1.id })
    expect(results[0].isPFDAOnly()).to.be.true()
    const names = results.map((x) => x.name)
    expect(names).to.deep.equal(['user1_folder2'])
  })
})
