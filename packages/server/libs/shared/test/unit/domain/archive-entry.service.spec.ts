import { ArchiveEntryService } from '@shared/domain/user-file/service/archive-entry.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { ArchiveEntryRepository } from '@shared/domain/user-file/archive-entry.repository'
import sinon, { stub } from 'sinon'

describe('ArchiveEntryService', () => {
  const transactionalStub = sinon.stub()
  const emRemoveStub = stub()
  const getArchiveEntriesForNodeStub = stub()

  const em = {
    transactional: transactionalStub,
    remove: emRemoveStub,
  } as unknown as SqlEntityManager

  const archiveEntryRepo = {
    getArchiveEntriesForNode: getArchiveEntriesForNodeStub,
  } as unknown as ArchiveEntryRepository

  beforeEach(() => {
    transactionalStub.callsFake(async (callback) => {
      return callback(em)
    })

    emRemoveStub.reset()
    emRemoveStub.throws()

    getArchiveEntriesForNodeStub.reset()
    getArchiveEntriesForNodeStub.throws()
  })

  describe('#removeArchiveEntriesForNode', async () => {
    it('basic with one archiveEntry', async () => {
      const NODE_ID = 1
      const archiveEntry = { name: 'archiveEntry' }

      getArchiveEntriesForNodeStub.withArgs(NODE_ID).returns([archiveEntry])
      emRemoveStub.reset()

      const service = getInstance()
      await service.removeArchiveEntriesForNode(NODE_ID)

      expect(emRemoveStub.calledWith(archiveEntry))
    })
  })

  function getInstance() {
    return new ArchiveEntryService(em, archiveEntryRepo)
  }
})
