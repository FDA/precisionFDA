import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import supertest from 'supertest'
import { App, Folder, Job, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { database } from '@pfda/https-apps-shared'
import {
  FILE_STI_TYPE,
  FILE_ORIGIN_TYPE,
} from '@pfda/https-apps-shared/src/domain/user-file/user-file.enum'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'

describe('PATCH /folders/:id/rename', () => {
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

  it('response shape', async () => {
    const { body } = await supertest(getServer())
      .patch(`/folders/${folder.id}/rename`)
      .query({ ...getDefaultQueryData(user) })
      .send({
        newName: 'b',
      })
      .expect(200)
    expect(body).to.be.deep.equal({
      id: folder.id,
      dxid: null,
      project: folder.project,
      name: 'b',
      user: user.id,
      entityType: FILE_ORIGIN_TYPE.HTTPS,
      stiType: FILE_STI_TYPE.FOLDER,
      taggings: [],
      scope: 'private',
      parentId: job.id,
      parentType: 'Job',
      uid: null,
      parentFolderId: null,
      scopedParentFolderId: null,
      description: null,
      state: null,
    })
  })

  it('handles subfolders too', async () => {
    const subfolder = create.filesHelper.createFolder(
      em,
      { user },
      { project: folder.project, name: 'c', parentFolderId: folder.id },
    )
    await em.flush()
    const { body } = await supertest(getServer())
      .patch(`/folders/${subfolder.id}/rename`)
      .query({ ...getDefaultQueryData(user) })
      .send({
        newName: 'd',
      })
      .expect(200)
    expect(body).to.have.property('id', subfolder.id)
    expect(body).to.have.property('name', 'd')
    expect(body).to.have.property('parentFolderId', folder.id)
  })

  context('error states', () => {
    it('if API call fails, name is not updated', async () => {
      fakes.client.folderRenameFake.throws()
      await supertest(getServer())
        .patch(`/folders/${folder.id}/rename`)
        .query({ ...getDefaultQueryData(user) })
        .send({
          newName: 'b',
        })
      em.clear()
      const folders = await em.find(Folder, {}, { filters: ['folder'] })
      expect(folders).to.have.lengthOf(1)
      expect(folders[0]).to.have.property('name', 'a')
    })
  })
})
