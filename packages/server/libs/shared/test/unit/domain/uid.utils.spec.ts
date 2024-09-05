import { UidUtils } from '@shared/utils/uid.utils'
import { expect } from 'chai'

describe('UidUtils', () => {
  describe('isValidUId', () => {
    it('should return true for a valid UId with a known entity type', () => {
      const validUId = 'user-123-1'
      expect(UidUtils.isValidUId(validUId)).to.be.true()
    })

    it('should return true for a valid UId with a matching entity type', () => {
      const validUId = 'job-xyz-42'
      expect(UidUtils.isValidUId(validUId, 'job')).to.be.true()
    })

    it('should return false for an invalid UId with a matching entity type', () => {
      const validUId = 'app-xyz-42'
      expect(UidUtils.isValidUId(validUId, 'job')).to.be.false()
    })

    it('should return false for a non integer end', () => {
      const validUId = 'app-xyz-42.1'
      expect(UidUtils.isValidUId(validUId, 'job')).to.be.false()
    })

    it('should return false for a UId without a dash', () => {
      const invalidUId = 'user123'
      expect(UidUtils.isValidUId(invalidUId)).to.be.false()
    })

    it('should return false for a UId with an invalid DxId', () => {
      const invalidUId = 'unknown-123-1'
      expect(UidUtils.isValidUId(invalidUId)).to.be.false()
    })

    it('should return false for a UId with a non-integer id', () => {
      const invalidUId = 'user-123-abc'
      expect(UidUtils.isValidUId(invalidUId)).to.be.false()
    })

    it('should return false for a UId with a mismatched entity type', () => {
      const invalidUId = 'user-123-1'
      expect(UidUtils.isValidUId(invalidUId, 'job')).to.be.false()
    })

    it('should return false for a UId with an empty id', () => {
      const invalidUId = 'user-123-'
      expect(UidUtils.isValidUId(invalidUId)).to.be.false()
    })
  })
})
