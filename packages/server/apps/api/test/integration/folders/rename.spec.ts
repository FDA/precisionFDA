import { EntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { create, db, generate } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import { IncomingHttpHeaders } from 'http2'
import supertest from 'supertest'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('PATCH /folders/:id/rename', () => {
  let em: EntityManager
  let user: User
  let app: App
  let job: Job
  let folder: Folder

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(
      em,
      { user, app },
      { scope: STATIC_SCOPE.PRIVATE, state: JOB_STATE.IDLE },
    )
    await em.flush()
    folder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'a', project: user.privateFilesProject, parentId: job.id, locked: false },
    )
    await em.flush()
    mocksReset()
  })

  it('response shape', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .patch(`/folders/${folder.id}/rename`)
      .set(getDefaultHeaderData(user) as unknown as IncomingHttpHeaders)
      .send({
        newName: 'b',
      })
      .expect(200)
    expect(body).to.be.deep.include({
      id: folder.id,
      dxid: null,
      project: folder.project,
      name: 'b',
      user: user.id,
      stiType: FILE_STI_TYPE.FOLDER,
      taggings: [],
      scope: 'private',
      parentId: job.id,
      parentType: 'Job',
      uid: null,
      parentFolder: null,
      scopedParentFolderId: null,
      description: null,
      state: null,
      isAsset: false,
      isFile: false,
      isFolder: true,
    })
  })

  it('handles subfolders too', async () => {
    const subfolder = create.filesHelper.createFolder(
      em,
      { user, parentFolder: folder },
      { project: folder.project, name: 'c', locked: false },
    )
    await em.flush()
    const { body } = await supertest(testedApp.getHttpServer())
      .patch(`/folders/${subfolder.id}/rename`)
      .set(getDefaultHeaderData(user) as unknown as IncomingHttpHeaders)
      .send({
        newName: 'd',
      })
      .expect(200)
    expect(body).to.have.property('id', subfolder.id)
    expect(body).to.have.property('name', 'd')
    expect(body).to.have.property('parentFolder', folder.id)
  })

  context('error states', () => {
    it('if API call fails, name is not updated', async () => {
      fakes.client.folderRenameFake.throws()
      await supertest(testedApp.getHttpServer())
        .patch(`/folders/${folder.id}/rename`)
        .set(getDefaultHeaderData(user) as unknown as IncomingHttpHeaders)
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
