import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { Logger } from '@nestjs/common'
import { database } from '@shared/database'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { ResourceRepository } from '@shared/domain/resource/resource.repository'
import { ResourceService } from '@shared/domain/resource/service/resource.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { NotFoundError, PermissionError } from '@shared/errors'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db } from '../../../src/test'


describe('ResourceService tests', () => {
  let user: User
  let space: Space
  let portal: DataPortal
  let file: UserFile
  let em: EntityManager<MySqlDriver>
  let resourceService: ResourceService
  const findResourcesByFileUidStub = stub()


  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    space = create.spacesHelper.create(em, { name: 'basic-portal' })
    create.spacesHelper.addMember(em, { space, user })
    portal = create.dataPortalsHelper.create(em, { space })
    file = create.filesHelper.createUploaded(em, { user }, { scope: `space-${space.id}` })
    await em.flush()
  })

  it('throws error on invalid fileUid ', async () => {
    resourceService = await getService(user)

    await expect(resourceService.getDownloadUrl('non-existing-uid'))
      .to.be.rejectedWith(NotFoundError, 'Resource for non-existing-uid not found')
  })

  it('throws error for non portal user', async () => {
    const nonPortalUser = create.userHelper.create(em)
    await em.flush()

    resourceService = await getService(nonPortalUser)
    await (expect(resourceService.getDownloadUrl(file.uid)))
      .to.be.rejectedWith(PermissionError, 'User is not a member of the portal')
  })

  it('throws error for non active portal user', async () => {
    const nonActivePortalUser = create.userHelper.create(em)
    create.spacesHelper.addMember(em, { space, user }, { active: false })

    resourceService = await getService(nonActivePortalUser)
    await (expect(resourceService.getDownloadUrl(file.uid)))
      .to.be.rejectedWith(PermissionError, 'User is not a member of the portal')
  })

  it('returns download url for permitted user', async () => {
    resourceService = await getService(user)
    const url = await resourceService.getDownloadUrl(file.uid)
    expect(url).to.be.eq('https://dnanexus.platform.com/file1.txt')
  })

  async function getService(user: User) {
    const repo = {
      findResourcesByFileUid: findResourcesByFileUidStub,
    } as unknown as ResourceRepository

    findResourcesByFileUidStub.withArgs(file.uid).returns([{
      url: 'https://dnanexus.platform.com/file1.txt',
      dataPortal: { id: portal.id },
    }])

    findResourcesByFileUidStub.withArgs('non-existing-uid').returns([])

    const userCtx = { id: user.id, accessToken: 'accessToken', dxuser: 'dxuser' } as UserContext
    const logger = { verbose: () => {}, error: () => {} } as unknown as Logger
    return new ResourceService(em, repo, userCtx, logger)
  }

})

