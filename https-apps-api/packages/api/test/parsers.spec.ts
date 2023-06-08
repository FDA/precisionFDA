import { expect } from 'chai'
import {
  parseBoundedNumberFromString,
  parseEnumValueFromString,
  parseIpv4Address,
  parseIpv4Cidr,
  parseNonEmptyString,
  parseNumberFromString,
  parseNumericRange,
  wrapMaybeEmpty,
  wrapMaybeUndefined,
} from '@pfda/https-apps-shared/src/validation/parsers'
import { ValidationError } from '@pfda/https-apps-shared/src/errors'
import { CustomAggregateError } from '@pfda/https-apps-shared/src/utils/aggregate-error'

describe('parseNonEmptyString', () => {
  it('should work on parsing non-empty string', () => {
    expect(parseNonEmptyString('asdf')).to.equal('asdf')
  })
  it('should fail on parsing empty string', () => {
    expect(() => parseNonEmptyString('')).to.throw(ValidationError)
  })
  it('should fail on parsing undefined', () => {
    expect(() => parseNonEmptyString(undefined)).to.throw(ValidationError)
  })
})

describe('parseEnumValueFromString', () => {
  const parser = parseEnumValueFromString(['val1', 'val2', 'val3'])
  it('should work on parsing valid enum value', () => {
    expect(parser('val1')).to.equal('val1')
  })
  it('should fail on parsing invalid enum value', () => {
    expect(() => parser('asdf')).to.throw(ValidationError)
  })
  it('should fail on parsing empty string', () => {
    expect(() => parser('')).to.throw(ValidationError)
  })
  it('should fail on parsing undefined', () => {
    expect(() => parser(undefined)).to.throw(ValidationError)
  })
})

describe('parseNumberFromString', () => {
  it('should work on parsing valid numeric value', () => {
    expect(parseNumberFromString('123')).to.equal(123)
  })
  it('should fail on parsing invalid numeric value', () => {
    expect(() => parseNumberFromString('asdf')).to.throw(ValidationError)
  })
})

describe('parseBoundedNumberFromString', () => {
  const parser = parseBoundedNumberFromString(4, 6)
  it('should fail on parsing valid numeric value below range', () => {
    expect(() => parser('3')).to.throw(ValidationError)
  })
  it('should work on parsing lower bound of range', () => {
    expect(parser('4')).to.equal(4)
  })
  it('should work on parsing number withing range', () => {
    expect(parser('5')).to.equal(5)
  })
  it('should work on parsing upper bound of range', () => {
    expect(parser('6')).to.equal(6)
  })
  it('should fail on parsing valid numeric value above range', () => {
    expect(() => parser('7')).to.throw(ValidationError)
  })
})

describe('parseNumericRnage', () => {
  it('should work on parsing valid range', () => {
    expect(parseNumericRange('1,2')).to.deep.equal({
      $gte: 1,
      $lte: 2,
    })
  })
  it('should fail on parsing range without delimiter', () => {
    expect(() => parseNumericRange('12')).to.throw(ValidationError)
  })
  it('should fail on parsing range with NaN', () => {
    expect(() => parseNumericRange('1,a')).to.throw(CustomAggregateError)
  })
})

describe('parseIpv4Address', () => {
  it('should work on parsing valid address', () => {
    expect(parseIpv4Address('127.0.0.1')).to.deep.equal([127, 0, 0, 1])
  })
  it('should fail on parsing string with invalid delimiter', () => {
    expect(() => parseIpv4Address('12,7.0,0.1')).to.throw(ValidationError)
  })
  it('should fail on parsing string with insufficient segmentes', () => {
    expect(() => parseIpv4Address('127.0.1')).to.throw(ValidationError)
  })
  it('should fail on parsing string with number out of range', () => {
    expect(() => parseIpv4Address('127.0.1.256')).to.throw(CustomAggregateError)
  })
})

describe('parseIpv4Cidr', () => {
  it('should work on parsing valid CIDR block', () => {
    expect(parseIpv4Cidr('127.0.0.1/16')).to.deep.equal({
      ipv4Quadruple: [127, 0, 0, 1],
      maskSize: 16,
    })
  })
  it('should fail on parsing CIDR block with invalid IP', () => {
    expect(() => parseIpv4Cidr('127.0.0.torta/16')).to.throw(CustomAggregateError)
  })
  it('should fail on parsing CIDR block with mask size out of range', () => {
    expect(() => parseIpv4Cidr('127.0.0.1/33')).to.throw(ValidationError)
  })
})

// Combinators tests begin here

describe('wrapMaybeUndefined(parseNonEmptyString)', () => {
  it('should work on parsing non-empty string', () => {
    expect(wrapMaybeUndefined(parseNonEmptyString)('asdf')).to.equal('asdf')
  })
  it('should fail on parsing empty string', () => {
    expect(() => wrapMaybeUndefined(parseNonEmptyString)('')).to.throw(ValidationError)
  })
  it('should fail on parsing undefined', () => {
    expect(wrapMaybeUndefined(parseNonEmptyString)(undefined)).to.equal(null)
  })
})

describe('wrapMaybeEmpty(parseNonEmptyString)', () => {
  it('should work on parsing non-empty string', () => {
    expect(wrapMaybeEmpty(parseNonEmptyString)('asdf')).to.equal('asdf')
  })
  it('should fail on parsing empty string', () => {
    expect(wrapMaybeEmpty(parseNonEmptyString)('')).to.equal(null)
  })
  it('should fail on parsing undefined', () => {
    expect(wrapMaybeEmpty(parseNonEmptyString)(undefined)).to.equal(null)
  })
})

// TODO(samuel) test tuple and aggregate error
