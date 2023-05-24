/* eslint-disable max-len */
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '../../../src/database'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { FILE_STATE_DX, PARENT_TYPE } from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'
import { Folder, User, UserFile } from '@pfda/https-apps-shared/src/domain'

describe('UserFileRepository tests', () => {
  let em: EntityManager<MySqlDriver>
  // let log: any
  let user1: User
  let user2: User
  let files: UserFile[]
  let folders: Folder[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    // log = getLogger()
    await em.flush()

    files = []
    folders = []

    // Create a file tree for two users for testing
    folders.push(create.filesHelper.createFolder(
      em,
      { user: user1 },
      { name: 'user1_folder1' },
    ))
    folders.push(create.filesHelper.createFolder(
      em,
      { user: user1 },
      { name: 'user1_folder2' },
    ))

    folders.push(create.filesHelper.createFolder(
      em,
      { user: user2 },
      { name: 'user2_folder1' },
    ))
    folders.push(create.filesHelper.createFolder(
      em,
      { user: user2 },
      { name: 'user2_folder2' },
    ))
    await em.flush()

    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file1', parentType: PARENT_TYPE.USER, parentId: user1.id }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file2', parentType: PARENT_TYPE.USER, parentId: user1.id }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file3', parentType: PARENT_TYPE.USER, parentId: user1.id }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file4', parentType: PARENT_TYPE.USER, parentId: user1.id, parentFolder: folders[0] }))
    files.push(create.filesHelper.create(em, { user: user1 }, { name: 'user1_file5', parentType: PARENT_TYPE.USER, parentId: user1.id, parentFolder: folders[1] }))

    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file1', parentType: PARENT_TYPE.USER, parentId: user2.id }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file2', parentType: PARENT_TYPE.USER, parentId: user2.id }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file3', parentType: PARENT_TYPE.USER, parentId: user2.id, parentFolder: folders[2] }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file4', parentType: PARENT_TYPE.USER, parentId: user2.id, parentFolder: folders[3] }))
    files.push(create.filesHelper.create(em, { user: user2 }, { name: 'user2_file5', parentType: PARENT_TYPE.USER, parentId: user2.id }))
    // Copy of the above file
    files.push(create.filesHelper.create(em, { user: user2 }, {
      name: 'user2_file5_copy',
      dxid: files[9].dxid,
      uid: `${files[9].dxid}-2`,
    }))
    await em.flush()
  })

  it('findFileWithUid', async () => {
    const repo = em.getRepository(UserFile)
    let result = await repo.findFileWithUid(files[1].uid)
    expect(result).to.be.not.null()
    expect(result?.name).to.equal('user1_file2')

    result = await repo.findFileWithUid(files[6].uid)
    expect(result).to.be.not.null()
    expect(result?.name).to.equal('user2_file2')

    result = await repo.findFileWithUid('file-no-such-uid')
    expect(result).to.be.null()
  })

  it('findFilesWithDxid', async () => {
    const repo = em.getRepository(UserFile)
    let result = await repo.findFilesWithDxid(files[0].dxid)
    expect(result).to.have.length(1)
    expect(result[0].name).to.equal('user1_file1')

    result = await repo.findFilesWithDxid(files[9].dxid)
    expect(result).to.have.length(2)
    expect(result[0].name).to.equal('user2_file5')
    expect(result[1].name).to.equal('user2_file5_copy')
  })

  it('findUnclosedFiles', async () => {
    const repo = em.getRepository(UserFile)
    let result = await repo.findUnclosedFiles(user1.id)
    // There should be done for now
    expect(result).to.have.length(0)

    // Now mark some files as either 'open' or 'closing'
    // user1
    files[0].state = FILE_STATE_DX.CLOSED
    files[1].state = FILE_STATE_DX.OPEN
    files[2].state = FILE_STATE_DX.CLOSING
    files[3].state = FILE_STATE_DX.CLOSED
    files[4].state = FILE_STATE_DX.OPEN
    // user2
    files[5].state = FILE_STATE_DX.OPEN
    files[6].state = FILE_STATE_DX.ABANDONED
    files[7].state = FILE_STATE_DX.CLOSED
    await em.flush()

    result = await repo.findUnclosedFiles(user1.id)
    expect(result).to.have.length(3)
    let resultUids = result.map(x => x.uid)
    expect(resultUids).to.deep.equal([files[1].uid, files[2].uid, files[4].uid])

    result = await repo.findUnclosedFiles(user2.id)
    expect(result).to.have.length(1)
    resultUids = result.map(x => x.uid)
    expect(resultUids).to.deep.equal([files[5].uid])
  })

  it('findUnclosedFiles should also find job outputs owned by user', async () => {
    const repo = em.getRepository(UserFile)

    // Add a couple of files that are created by jobs but owned by the user
    const job = create.jobHelper.create(em, { user: user1 })
    await em.flush()
    const jobFile1 = create.filesHelper.createJobOutput(
      em,
      { user: user1, jobId: job.id },
      { state: FILE_STATE_DX.CLOSING },
    )
    const jobFile2 = create.filesHelper.createJobOutput(
      em,
      { user: user1, jobId: job.id },
      { state: FILE_STATE_DX.OPEN },
    )
    await em.flush()

    let result = await repo.findUnclosedFiles(user1.id)
    expect(result).to.have.length(2)
    const resultUids = result.map(x => x.uid)
    expect(resultUids).to.deep.equal([jobFile1.uid, jobFile2.uid])

    result = await repo.findUnclosedFiles(user2.id)
    expect(result).to.have.length(0)
  })
})
