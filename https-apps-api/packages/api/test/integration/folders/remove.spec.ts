import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import supertest from 'supertest'
import { App, Folder, Job, Tag, User, UserFile } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { database, errors } from '@pfda/https-apps-shared'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'

describe('DELETE /folders/:id', () => {
  let em: EntityManager
  let user: User
  let app: App
  let job: Job
  let folder: Folder

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    await em.flush()
    folder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'a', project: user.privateFilesProject, parentId: job.id },
    )
    await em.flush()
    mocksReset()
  })

  it('response shape & mocks call', async () => {
    await supertest(getServer())
      .delete(`/folders/${folder.id}`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    expect(fakes.client.folderRemoveFake.calledOnce).to.be.true()
    const clientCall = fakes.client.folderRemoveFake.getCall(0).args[0]
    expect(clientCall).to.have.property('folderPath', '/a')
    expect(clientCall).to.have.property('projectId', folder.project)
  })

  it('removes the folder from database', async () => {
    await supertest(getServer())
      .delete(`/folders/${folder.id}`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    em.clear()
    const foldersInDb = await em.find(Folder, {}, { filters: ['folder'] })
    expect(foldersInDb).to.have.lengthOf(0)
  })

  it('removes subfolder', async () => {
    const subfolder = create.filesHelper.createFolder(
      em,
      { user },
      { project: folder.project, name: 'b', parentFolderId: folder.id },
    )
    await em.flush()
    await supertest(getServer())
      .delete(`/folders/${subfolder.id}`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    // subfolder path built properly
    const clientCall = fakes.client.folderRemoveFake.getCall(0).args[0]
    expect(clientCall).to.have.property('folderPath', '/a/b')

    em.clear()
    const foldersInDb = await em.find(Folder, {}, { filters: ['folder'] })
    expect(foldersInDb).to.have.lengthOf(1)
    expect(foldersInDb[0]).to.have.property('id', folder.id)
  })

  it('removes subfolder and file in it', async () => {
    const subfolder = create.filesHelper.createFolder(
      em,
      { user },
      { project: folder.project, name: 'b', parentFolderId: folder.id },
    )
    const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
    await em.flush()
    const folderFile = create.filesHelper.create(
      em,
      { user },
      {
        project: folder.project,
        parentFolderId: folder.id,
      },
    )
    const subfolderFile = create.filesHelper.create(
      em,
      { user },
      {
        project: folder.project,
        parentFolderId: subfolder.id,
      },
    )
    create.tagsHelper.createTagging(
      em,
      { tag },
      {
        userFile: folderFile,
        tagger: user,
      },
    )
    create.tagsHelper.createTagging(
      em,
      { tag },
      {
        userFile: subfolderFile,
        tagger: user,
      },
    )
    await em.flush()
    await supertest(getServer())
      .delete(`/folders/${subfolder.id}`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    em.clear()
    const foldersInDb = await em.find(Folder, {}, { filters: ['folder'] })
    expect(foldersInDb).to.have.lengthOf(1)
    expect(foldersInDb[0]).to.have.property('id', folder.id)
    const filesInDb = await em.find(UserFile, {}, { filters: ['userfile'] })
    expect(filesInDb).to.have.lengthOf(1)
    expect(filesInDb[0]).to.have.property('id', folderFile.id)
    // tags are handled as well
    const tags = await em.find(Tag, {}, { populate: ['taggings'] })
    expect(tags).to.have.lengthOf(1)
    expect(tags[0]).to.have.property('taggingCount', 1)
    expect(tags[0]).to.have.property('taggings')
    expect(tags[0].taggings.getItems()).to.have.lengthOf(1)
    expect(tags[0].taggings.getItems()[0]).to.have.property('taggableId', folderFile.id)
  })

  it('removes subtree also with files', async () => {
    const subfolder = create.filesHelper.createFolder(
      em,
      { user },
      { project: folder.project, name: 'b', parentFolderId: folder.id },
    )
    const tag = create.tagsHelper.create(em, { name: 'HTTPS File' })
    await em.flush()
    const folderFile = create.filesHelper.create(
      em,
      { user },
      {
        project: folder.project,
        parentFolderId: folder.id,
      },
    )
    const subfolderFile = create.filesHelper.create(
      em,
      { user },
      {
        project: folder.project,
        parentFolderId: subfolder.id,
      },
    )
    create.tagsHelper.createTagging(
      em,
      { tag },
      {
        userFile: folderFile,
        tagger: user,
      },
    )
    create.tagsHelper.createTagging(
      em,
      { tag },
      {
        userFile: subfolderFile,
        tagger: user,
      },
    )
    await em.flush()
    await supertest(getServer())
      .delete(`/folders/${folder.id}`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    em.clear()
    const foldersInDb = await em.find(Folder, {}, { filters: ['folder'] })
    expect(foldersInDb).to.have.lengthOf(0)
    const filesInDb = await em.find(UserFile, {}, { filters: ['userfile'] })
    expect(filesInDb).to.have.lengthOf(0)
    // tags are handled as well
    const tags = await em.find(Tag, {}, { populate: ['taggings'] })
    expect(tags).to.have.lengthOf(1)
    expect(tags[0]).to.have.property('taggingCount', 0)
    expect(tags[0]).to.have.property('taggings')
    expect(tags[0].taggings.getItems()).to.have.lengthOf(0)
  })

  context('error states', () => {
    it('returns 404 when folder does not exist or does not have projectId assigned', async () => {
      folder.project = null
      await em.flush()
      const { body } = await supertest(getServer())
        .delete(`/folders/${folder.id}`)
        .query({ ...getDefaultQueryData(user) })
        .expect(404)
      expect(body.error).to.have.property('code', errors.ErrorCodes.FOLDER_NOT_FOUND)
    })
  })
})
