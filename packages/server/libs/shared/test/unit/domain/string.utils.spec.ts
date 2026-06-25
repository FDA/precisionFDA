import { expect } from 'chai'
import { StringUtils } from '@shared/utils/string.utils'

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

  describe('stripOutWildcards', () => {
    it('should remove a single percentage sign (%) from the string', () => {
      const input = 'select%user'
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('selectuser')
    })

    it('should remove a single underscore (_) from the string', () => {
      const input = 'user_name'
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('username')
    })

    it('should remove a single backslash (\\) from the string', () => {
      const input = 'path\\to\\file'
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('pathtofile')
    })

    it('should remove multiple mixed wildcards throughout the string', () => {
      const input = '%admin\\_user%'
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('adminuser')
    })

    it('should return an empty string if the input only contains wildcards', () => {
      const input = '%%__\\\\%%'
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('')
    })

    it('should return the exact same string if no wildcards are present', () => {
      const input = 'Hello-World-123!'
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('Hello-World-123!')
    })

    it('should handle an empty string gracefully', () => {
      const input = ''
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('')
    })

    it('should preserve spaces and other special characters', () => {
      const input = 'hello % world _ !'
      const result = StringUtils.stripOutWildcards(input)
      expect(result).to.equal('hello  world  !')
    })
  })
})
