import { IsSpaceReportOptionsValidConstraint } from '@shared/domain/space-report/constraint/is-space-report-options-valid.constraint'
import { expect } from 'chai'
import { ValidationArguments } from 'class-validator'

describe('IsSpaceReportOptionsValidConstraint', () => {
  describe('#validate', () => {
    it('should fail with options for no options format', async () => {
      const res = await validate({}, { object: { format: 'HTML' } })

      expect(res).to.be.false()
    })

    it('should pass with no options for no options format', async () => {
      const res = await validate(null, { object: { format: 'HTML' } })

      expect(res).to.be.true()
    })

    it('should pass with no options', async () => {
      const res = await validate(null, { object: { format: 'JSON' } })

      expect(res).to.be.true()
    })

    it('should fail with non-object options', async () => {
      const res = await validate('foo', { object: { format: 'JSON' } })

      expect(res).to.be.false()
    })

    it('should pass with boolean prettyPrint', async () => {
      const res = await validate({ prettyPrint: true }, { object: { format: 'JSON' } })

      expect(res).to.be.true()
    })

    it('should fail with non-boolean prettyPrint', async () => {
      const res = await validate({ prettyPrint: 'foo' }, { object: { format: 'JSON' } })

      expect(res).to.be.false()
    })

    function validate(value: unknown, args: { object?: unknown }) {
      return getInstance().validate(value, args as ValidationArguments)
    }
  })

  describe('#defaultMessage', () => {
    it('should work with null object', () => {
      const res = defaultMessage({ object: null })

      expect(res).to.equal('Options do not satisfy constraints for the provided format "undefined"')
    })

    it('should work with undefined object', () => {
      const res = defaultMessage({ object: undefined })

      expect(res).to.equal('Options do not satisfy constraints for the provided format "undefined"')
    })

    it('should work with no format', () => {
      const res = defaultMessage({ object: {} })

      expect(res).to.equal('Options do not satisfy constraints for the provided format "undefined"')
    })

    it('should work with null format', () => {
      const res = defaultMessage({ object: { format: null } })

      expect(res).to.equal('Options do not satisfy constraints for the provided format "null"')
    })

    it('should work with format', () => {
      const res = defaultMessage({ object: { format: 'FORMAT' } })

      expect(res).to.equal('Options do not satisfy constraints for the provided format "FORMAT"')
    })

    function defaultMessage(args: { object?: unknown }) {
      return getInstance().defaultMessage(args as ValidationArguments)
    }
  })

  function getInstance() {
    return new IsSpaceReportOptionsValidConstraint()
  }
})
