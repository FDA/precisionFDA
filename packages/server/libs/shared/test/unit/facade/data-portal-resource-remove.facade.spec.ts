import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { Resource } from '@shared/domain/resource/resource.entity'
import { ResourceService } from '@shared/domain/resource/service/resource.service'
import { Space } from '@shared/domain/space/space.entity'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { NotFoundError } from '@shared/errors'
import { DataPortalResourceRemoveFacade } from '@shared/facade/data-portal-resource/data-portal-resource-remove.facade'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'

describe('DataPortalResourceRemoveFacade', () => {
  const findEditableOneStub = stub()
  const removeByIdStub = stub()
  const removeNodesStub = stub()
  const getByUrlSlugOrIdStub = stub()

  const PORTAL_SLUG = 'portal-slug'
  const RESOURCE = {
    id: 1,
    dataPortal: {
      urlSlug: PORTAL_SLUG,
    } as unknown as DataPortal,
  } as unknown as Resource

  const SPACE = {
    id: 10,
  } as unknown as Space

  const PORTAL = {
    id: 100,
    urlSlug: PORTAL_SLUG,
    spaceId: SPACE.id,
  }

  const USER_FILE = {
    id: 123,
    uid: 'file-uid-1',
    resource: RESOURCE,
    scope: `space-${SPACE.id}`,
  } as unknown as UserFile

  const em = {
    transactional: async (cb: () => Promise<void>) => {
      await cb()
    },
  } as unknown as SqlEntityManager
  const userFileService = {
    findEditableOne: findEditableOneStub,
  } as unknown as UserFileService
  const resourceService = {
    removeById: removeByIdStub,
  } as unknown as ResourceService
  const dataPortalService = {
    getByUrlSlugOrId: getByUrlSlugOrIdStub,
  } as unknown as DataPortalService
  const removeNodesFacade = {
    removeNodes: removeNodesStub,
  } as unknown as RemoveNodesFacade

  beforeEach(() => {
    findEditableOneStub.reset()
    findEditableOneStub.resolves(null)
    findEditableOneStub.withArgs({ resource: RESOURCE.id, scope: `space-${SPACE.id}` }).resolves(USER_FILE)

    removeByIdStub.reset()
    removeByIdStub.resolves()

    removeNodesStub.reset()
    removeNodesStub.resolves()

    getByUrlSlugOrIdStub.reset()
    getByUrlSlugOrIdStub.throws()
    getByUrlSlugOrIdStub.withArgs(RESOURCE.dataPortal.urlSlug).resolves(PORTAL)
  })

  context('#remove', () => {
    it('should remove resource and associated file when resource exists', async () => {
      const facade = getInstance()
      await facade.remove(RESOURCE.id, RESOURCE.dataPortal.urlSlug)

      expect(getByUrlSlugOrIdStub.calledOnceWithExactly(RESOURCE.dataPortal.urlSlug)).to.be.true()
      expect(
        findEditableOneStub.calledOnceWithExactly({ resource: RESOURCE.id, scope: `space-${SPACE.id}` }),
      ).to.be.true()
      expect(removeByIdStub.calledOnceWithExactly(RESOURCE.id)).to.be.true()
      expect(removeNodesStub.calledOnceWithExactly([USER_FILE.id])).to.be.true()
    })

    it('should throw error when getByUrlSlugOrId fails', async () => {
      const identifier = 'invalid-slug'
      getByUrlSlugOrIdStub.throws(new NotFoundError(`DataPortal with identifier ${identifier} was not found`))

      const facade = getInstance()
      await expect(facade.remove(RESOURCE.id, identifier)).to.be.rejectedWith(
        NotFoundError,
        `DataPortal with identifier ${identifier} was not found`,
      )

      expect(getByUrlSlugOrIdStub.calledOnceWithExactly(identifier)).to.be.true()
      expect(findEditableOneStub.notCalled).to.be.true()
      expect(removeByIdStub.notCalled).to.be.true()
      expect(removeNodesStub.notCalled).to.be.true()
    })

    it('should throw NotFoundError when resource does not exist', async () => {
      const facade = getInstance()
      await expect(facade.remove(999, PORTAL.urlSlug)).to.be.rejectedWith(
        NotFoundError,
        `Resource 999 not found in data portal: ${PORTAL.urlSlug}`,
      )

      expect(findEditableOneStub.calledOnceWithExactly({ resource: 999, scope: `space-${SPACE.id}` })).to.be.true()
      expect(removeByIdStub.notCalled).to.be.true()
      expect(removeNodesStub.notCalled).to.be.true()
    })
  })

  function getInstance(): DataPortalResourceRemoveFacade {
    return new DataPortalResourceRemoveFacade(
      em,
      userFileService,
      resourceService,
      dataPortalService,
      removeNodesFacade,
    )
  }
})
