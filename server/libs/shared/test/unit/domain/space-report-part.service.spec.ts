import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { BatchComplete } from '@shared/domain/space-report/model/batch-complete'
import { SpaceReportPartSource } from '@shared/domain/space-report/model/space-report-part-source'
import { SpaceReportPartService } from '@shared/domain/space-report/service/part/space-report-part.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportPartService', () => {
  const transactionalStub = stub()
  const findStub = stub()

  beforeEach(() => {
    transactionalStub.reset()
    transactionalStub.throws()

    findStub.reset()
    findStub.throws()
  })

  describe('#createReportParts', () => {
    it('should return empty array for empty input', () => {
      const res = getInstance().createReportParts([])

      expect(res).to.be.an('array')
      expect(res).to.be.empty()
    })

    it('should create report part for each source', () => {
      const PART_1_SOURCE_ID = 0
      const PART_1_SOURCE_TYPE = 'PART_1_SOURCE_TYPE'
      const PART_1_SOURCE = { id: PART_1_SOURCE_ID, type: PART_1_SOURCE_TYPE }

      const PART_2_SOURCE_ID = 0
      const PART_2_SOURCE_TYPE = 'PART_2_SOURCE_TYPE'
      const PART_2_SOURCE = { id: PART_2_SOURCE_ID, type: PART_2_SOURCE_TYPE }

      const PART_3_SOURCE_ID = 0
      const PART_3_SOURCE_TYPE = 'PART_3_SOURCE_TYPE'
      const PART_3_SOURCE = { id: PART_3_SOURCE_ID, type: PART_3_SOURCE_TYPE }

      const res = getInstance().createReportParts([
        PART_1_SOURCE,
        PART_2_SOURCE,
        PART_3_SOURCE,
      ] as SpaceReportPartSource[])

      expect(res).to.be.an('array')
      expect(res).to.have.lengthOf(3)

      const part1 = res[0]
      expect(part1.sourceId).to.equal(PART_1_SOURCE_ID)
      expect(part1.sourceType).to.equal(PART_1_SOURCE_TYPE)

      const part2 = res[1]
      expect(part2.sourceId).to.equal(PART_2_SOURCE_ID)
      expect(part2.sourceType).to.equal(PART_2_SOURCE_TYPE)

      const part3 = res[2]
      expect(part3.sourceId).to.equal(PART_3_SOURCE_ID)
      expect(part3.sourceType).to.equal(PART_3_SOURCE_TYPE)
    })
  })

  describe('#completeBatch', () => {
    const PART_1_ID = 1
    const PART_1_RESULT = 'PART_1_RESULT'
    const PART_1_COMPLETE = { id: PART_1_ID, result: PART_1_RESULT }

    const PART_2_ID = 2
    const PART_2_RESULT = 'PART_2_RESULT'
    const PART_2_COMPLETE = { id: PART_2_ID, result: PART_2_RESULT }

    const PART_3_ID = 3
    const PART_3_RESULT = 'PART_3_RESULT'
    const PART_3_COMPLETE = { id: PART_3_ID, result: PART_3_RESULT }

    const PART_COMPLETES = [
      PART_1_COMPLETE,
      PART_2_COMPLETE,
      PART_3_COMPLETE,
    ] as unknown as BatchComplete[]

    let PART_1
    let PART_2
    let PART_3

    beforeEach(() => {
      transactionalStub.reset()
      transactionalStub.callsArg(0)

      PART_1 = { id: PART_1_ID, state: 'CREATED' }
      PART_2 = { id: PART_2_ID, state: 'CREATED' }
      PART_3 = { id: PART_3_ID, state: 'CREATED' }
      findStub
        .withArgs(SpaceReportPart, [PART_1_ID, PART_2_ID, PART_3_ID])
        .resolves([PART_1, PART_2, PART_3])
    })

    it('should return empty result for empty input', async () => {
      const res = await getInstance().completeBatch([])

      expect(res).to.be.an('array')
      expect(res).to.be.empty()
    })

    it('should not catch error from transactional', async () => {
      const error = new Error('my error')
      transactionalStub.reset()
      transactionalStub.throws(error)

      await expect(getInstance().completeBatch(PART_COMPLETES)).to.be.rejectedWith(error)
    })

    it('should not catch error from find', async () => {
      const error = new Error('my error')
      findStub.reset()
      findStub.rejects(error)

      await expect(getInstance().completeBatch(PART_COMPLETES)).to.be.rejectedWith(error)
    })

    it('should correctly update report parts', async () => {
      const res = await getInstance().completeBatch(PART_COMPLETES)

      expect(res).to.be.an('array')
      expect(res).to.have.lengthOf(3)

      const part1 = res[0]
      expect(part1).to.eq(PART_1)
      expect(part1.result).to.eq(PART_1_RESULT)
      expect(part1.state).to.eq('DONE')

      const part2 = res[1]
      expect(part2).to.eq(PART_2)
      expect(part2.result).to.eq(PART_2_RESULT)
      expect(part2.state).to.eq('DONE')

      const part3 = res[2]
      expect(part3).to.eq(PART_3)
      expect(part3.result).to.eq(PART_3_RESULT)
      expect(part3.state).to.eq('DONE')
    })
  })

  function getInstance() {
    const em = {
      transactional: transactionalStub,
      find: findStub,
    } as unknown as SqlEntityManager

    return new SpaceReportPartService(em)
  }
})
