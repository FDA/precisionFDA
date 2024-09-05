import { DxIdUtils } from '@shared/utils/dxid.utils'
import { expect } from 'chai'

describe('DxIdUtils', () => {
  describe('isDxIdValid', () => {
    it('should return true for a valid DxId with a known entity type', () => {
      const validDxId = 'user-123'
      expect(DxIdUtils.isDxIdValid(validDxId)).to.be.true()
    })

    it('should return true for a valid DxId with a known platform entity type', () => {
      const validDxId = 'stage-abc'
      expect(DxIdUtils.isDxIdValid(validDxId)).to.be.true()
    })

    it('should return true for a valid DxId with a matching entity type', () => {
      const validDxId = 'job-xyz'
      expect(DxIdUtils.isDxIdValid(validDxId, 'job')).to.be.true()
    })

    it('should return false for an invalid DxId with a matching entity type', () => {
      const validDxId = 'app-xyz'
      expect(DxIdUtils.isDxIdValid(validDxId, 'job')).to.be.false()
    })

    it('should return false for a non-string value', () => {
      const invalidDxId = 123
      expect(DxIdUtils.isDxIdValid(invalidDxId as any)).to.be.false()
    })

    it('should return false for a DxId with an invalid format', () => {
      const invalidDxId = 'user123'
      expect(DxIdUtils.isDxIdValid(invalidDxId)).to.be.false()
    })

    it('should return false for a DxId with more than two parts', () => {
      const invalidDxId = 'user-123-abc'
      expect(DxIdUtils.isDxIdValid(invalidDxId)).to.be.false()
    })

    it('should return false for a DxId with an unknown entity type', () => {
      const invalidDxId = 'unknown-123'
      expect(DxIdUtils.isDxIdValid(invalidDxId)).to.be.false()
    })

    it('should return false for a DxId with a mismatched entity type', () => {
      const invalidDxId = 'user-123'
      expect(DxIdUtils.isDxIdValid(invalidDxId, 'job')).to.be.false()
    })

    it('should return false for a DxId with an empty id', () => {
      const invalidDxId = 'user-'
      expect(DxIdUtils.isDxIdValid(invalidDxId)).to.be.false()
    })
  })
})
