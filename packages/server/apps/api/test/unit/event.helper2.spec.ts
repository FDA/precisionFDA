import { expect } from 'chai'
import { EventHelper } from '@shared/domain/event/event.helper'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { FileOrAsset } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { stub } from 'sinon'
import { Organization } from '@shared/domain/org/organization.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'

/**
 * Event helper is in transition from a bunch of functions to a class-based approach.
 * Once this is done, this test file should be renamed to event.helper.spec.ts
 */
describe('EventHelper', () => {
  let orgLoadStub = stub()
  let orgIsInitializedStub = stub()

  const org = { handle: 'org1' } as unknown as Organization
  const user = {
    dxuser: 'user1',
    organization: {
      isInitialized: orgIsInitializedStub,
      getEntity: () => org,
      load: orgLoadStub,
    },
  } as unknown as User
  const file = {
    id: 13,
    scope: 'private',
    name: 'test.txt',
    fileSize: 1234,
    dxid: 'file-1234',
  } as unknown as FileOrAsset
  const folder = {
    id: 14,
    scope: 'public',
    name: 'myfolder',
  } as unknown as Folder
  const filePath = '/path/to/test.txt'
  const folderPath = `/path/to/${folder.name}`

  beforeEach(async () => {
    orgLoadStub.reset()
    orgLoadStub.throws()

    orgIsInitializedStub.reset()
  })

  describe('#createFileEvent', () => {
    it('org loaded', async () => {
      orgIsInitializedStub.returns(true)
      const eventHelper = getInstance()

      const event = await eventHelper.createFileEvent(
        EVENT_TYPES.FILE_DELETED,
        file,
        filePath,
        user,
        'param3',
      )

      expect(event.type).to.equal(EVENT_TYPES.FILE_DELETED)
      expect(event.orgHandle).to.equal(org.handle)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(file.fileSize.toString())
      expect(event.param2).to.equal(file.dxid)
      expect(event.param3).to.equal('param3')
      expect(event.data).to.equal(
        JSON.stringify({
          id: file.id,
          scope: file.scope,
          name: file.name,
          path: filePath,
        }),
      )
    })

    it('load org', async () => {
      orgIsInitializedStub.returns(false)
      orgLoadStub.resolves(org)
      const eventHelper = getInstance()

      const event = await eventHelper.createFileEvent(
        EVENT_TYPES.FILE_DELETED,
        file,
        filePath,
        user,
        'param3',
      )

      expect(event.type).to.equal(EVENT_TYPES.FILE_DELETED)
      expect(event.orgHandle).to.equal(org.handle)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(file.fileSize.toString())
      expect(event.param2).to.equal(file.dxid)
      expect(event.param3).to.equal('param3')
      expect(event.data).to.equal(
        JSON.stringify({
          id: file.id,
          scope: file.scope,
          name: file.name,
          path: filePath,
        }),
      )
      expect(orgLoadStub.calledOnce).to.be.true
    })
  })

  describe('#createFolderEvent', () => {
    it('org loaded', async () => {
      orgIsInitializedStub.returns(true)
      const eventHelper = getInstance()

      const event = await eventHelper.createFolderEvent(
        EVENT_TYPES.FOLDER_CREATED,
        folder,
        folderPath,
        user,
      )

      expect(event.type).to.equal(EVENT_TYPES.FOLDER_CREATED)
      expect(event.orgHandle).to.equal(org.handle)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(folderPath)
      expect(event.data).to.equal(
        JSON.stringify({
          id: folder.id,
          scope: folder.scope,
          name: folder.name,
          path: folderPath,
        }),
      )
    })

    it('org not loaded', async () => {
      orgIsInitializedStub.returns(false)
      orgLoadStub.resolves(org)
      const eventHelper = getInstance()

      const event = await eventHelper.createFolderEvent(
        EVENT_TYPES.FOLDER_CREATED,
        folder,
        folderPath,
        user,
      )

      expect(event.type).to.equal(EVENT_TYPES.FOLDER_CREATED)
      expect(event.orgHandle).to.equal(org.handle)
      expect(event.dxuser).to.equal(user.dxuser)
      expect(event.param1).to.equal(folderPath)
      expect(event.data).to.equal(
        JSON.stringify({
          id: folder.id,
          scope: folder.scope,
          name: folder.name,
          path: folderPath,
        }),
      )
      expect(orgLoadStub.calledOnce).to.be.true
    })
  })

  function getInstance(): EventHelper {
    return new EventHelper()
  }
})
