import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import supertest from 'supertest'
import { App, Folder, Job, Tag, User, UserFile } from '@pfda/https-apps-shared/src/domain'
import { PARENT_TYPE } from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { database, errors } from '@pfda/https-apps-shared'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'

describe('POST /folders/recreate', () => {
  let em: EntityManager
  let user: User
  // let app: App
  // let job: Job
  // let folder: Folder

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { privateFilesProject: generate.random.dxstr() })
    // app = create.appHelper.create(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    // job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    await em.flush()
    // folder = create.filesHelper.createFolder(
    //   em,
    //   { user },
    //   { name: 'a', project: user.jupyterProject, parentId: job.id },
    // )
    // await em.flush()
    mocksReset()
  })

  it('response shape & mocks default call', async () => {
    await supertest(getServer())
      .post('/folders/recreate')
      .query({ ...getDefaultQueryData(user) })
      .expect(204)
    expect(fakes.client.foldersListFake.calledOnce).to.be.true()
    expect(fakes.client.folderCreateFake.notCalled).to.be.true()
    expect(fakes.client.filesMoveFake.notCalled).to.be.true()
  })

  it('calls folderCreate client endpoint', async () => {
    const localFolder = create.filesHelper.createLocalOnlyFolder(
      em,
      { user },
      { parentId: user.id },
    )
    await em.flush()
    await supertest(getServer())
      .post('/folders/recreate')
      .query({ ...getDefaultQueryData(user) })
      .expect(204)

    expect(fakes.client.foldersListFake.calledOnce).to.be.true()
    expect(fakes.client.folderCreateFake.calledOnce).to.be.true()
    expect(fakes.client.filesMoveFake.notCalled).to.be.true()

    const folderCreateApiCall = fakes.client.folderCreateFake.getCall(0).args[0]
    expect(folderCreateApiCall).to.have.property('projectId', user.privateFilesProject)
    expect(folderCreateApiCall).to.have.property('folderPath', `/${localFolder.name}`)
  })

  it('calls folderCreate client endpoint with leaf folder only', async () => {
    // todo: make sure data in DB match
    const localFolder = create.filesHelper.createLocalOnlyFolder(
      em,
      { user },
      { parentId: user.id },
    )
    await em.flush()
    const localSubfolder = create.filesHelper.createLocalOnlyFolder(
      em,
      { user, parentFolder: localFolder },
      {
        parentId: user.id,
      },
    )
    await em.flush()
    await supertest(getServer())
      .post('/folders/recreate')
      .query({ ...getDefaultQueryData(user) })
      .expect(204)

    expect(fakes.client.foldersListFake.calledOnce).to.be.true()
    // called only once even though we have two folders now
    expect(fakes.client.folderCreateFake.calledOnce).to.be.true()
    expect(fakes.client.filesMoveFake.notCalled).to.be.true()

    const folderCreateApiCall = fakes.client.folderCreateFake.getCall(0).args[0]
    expect(folderCreateApiCall).to.have.property('projectId', user.privateFilesProject)
    expect(folderCreateApiCall).to.have.property(
      'folderPath',
      `/${localFolder.name}/${localSubfolder.name}`,
    )
  })
})
