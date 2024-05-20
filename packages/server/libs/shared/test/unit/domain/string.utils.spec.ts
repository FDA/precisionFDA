import { StringUtils } from '@shared/utils/string.utils'
import { expect } from 'chai'

describe('StringUtils', () => {
  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(StringUtils.isEmpty(null)).to.be.true()
    })

    it('should return true for an empty string', () => {
      expect(StringUtils.isEmpty('')).to.be.true()
    })

    it('should return false for a non-empty string', () => {
      expect(StringUtils.isEmpty('hello')).to.be.false()
    })

    it('should return false for a string with whitespace', () => {
      expect(StringUtils.isEmpty('  ')).to.be.false()
    })
  })

  describe('isInteger', () => {
    it('should return true for a valid integer string', () => {
      expect(StringUtils.isInteger('42')).to.be.true()
    })

    it('should return true for a valid negative integer string', () => {
      expect(StringUtils.isInteger('-10')).to.be.true()
    })

    it('should return false for a floating-point number string', () => {
      expect(StringUtils.isInteger('3.14')).to.be.false()
    })

    it('should return false for a non-numeric string', () => {
      expect(StringUtils.isInteger('abc')).to.be.false()
    })

    it('should return false for an empty string', () => {
      expect(StringUtils.isInteger('')).to.be.false()
    })

    it('should return false for a string with leading/trailing whitespace', () => {
      expect(StringUtils.isInteger(' 42 ')).to.be.false()
    })
  })
})
