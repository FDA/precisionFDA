import type { EntityManager, SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import supertest from 'supertest'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

describe('Publish Controller', () => {
  let em: SqlEntityManager

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
  })

  it('should publish folder and its children', async () => {
    const user = create.userHelper.createSiteAdmin(em)
    create.sessionHelper.create(em, { user })
    const folder = create.filesHelper.createLocalOnlyFolder(em, { user }, {})
    await em.flush()
    const childFile = create.filesHelper.create(em, { user, parentFolder: folder })
    await em.flush()
    const childFolder = create.filesHelper.createLocalOnlyFolder(em, { user, parentFolder: folder })
    await em.flush()
    const childFolderFile = create.filesHelper.create(em, {
      user,
      parentFolder: childFolder,
    })
    await em.flush()

    await supertest(testedApp.getHttpServer())
      .post('/publish')
      .set(getDefaultHeaderData(user))
      .send({ identifier: `folder-${folder.id}`, type: 'folder' })
      .expect(200)

    const publishedFolder = await em.findOneOrFail(Folder, folder.id)
    const publishedChildFile = await em.findOneOrFail(UserFile, childFile.id)
    const publishedChildFolder = await em.findOneOrFail(Folder, childFolder.id)
    const publishedChildFolderFile = await em.findOneOrFail(UserFile, childFolderFile.id)

    expect(publishedFolder.isPublic()).to.be.true
    expect(publishedChildFile.isPublic()).to.be.true
    expect(publishedChildFolder.isPublic()).to.be.true
    expect(publishedChildFolderFile.isPublic()).to.be.true
  })
})
