import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CliListSpacesQueryDTO } from '@shared/domain/cli/dto/cli-list-spaces-query.dto'
import { CliScopeQueryDTO } from '@shared/domain/cli/dto/cli-scope-query.dto'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'

describe('CliListSpacesQueryDTO', () => {
  const toInstance = (plain: Record<string, unknown>): CliListSpacesQueryDTO =>
    plainToInstance(CliListSpacesQueryDTO, plain, { enableImplicitConversion: false })

  describe('state', () => {
    it('transforms "active" to SPACE_STATE.ACTIVE', async () => {
      const dto = toInstance({ state: 'active' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.state).to.equal(SPACE_STATE.ACTIVE)
    })

    it('transforms "locked" to SPACE_STATE.LOCKED', async () => {
      const dto = toInstance({ state: 'locked' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.state).to.equal(SPACE_STATE.LOCKED)
    })

    it('transforms "unactivated" to SPACE_STATE.UNACTIVATED', async () => {
      const dto = toInstance({ state: 'unactivated' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.state).to.equal(SPACE_STATE.UNACTIVATED)
    })

    it('leaves state undefined when omitted', async () => {
      const dto = toInstance({})
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.state).to.equal(undefined)
    })

    it('returns a validation error for invalid state', async () => {
      const dto = toInstance({ state: 'foobar' })
      const errors = await validate(dto)
      expect(errors).to.have.length.greaterThan(0)
      expect(errors[0].property).to.equal('state')
    })
  })

  describe('protected', () => {
    it('transforms "true" to true', async () => {
      const dto = toInstance({ protected: 'true' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.protected).to.equal(true)
    })

    it('transforms "false" to false', async () => {
      const dto = toInstance({ protected: 'false' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.protected).to.equal(false)
    })

    it('leaves protected undefined when omitted', async () => {
      const dto = toInstance({})
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.protected).to.equal(undefined)
    })
  })

  describe('types', () => {
    it('transforms ["0","1"] to [SPACE_TYPE.GROUPS, SPACE_TYPE.REVIEW]', async () => {
      const dto = toInstance({ types: ['0', '1'] })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.types).to.deep.equal([SPACE_TYPE.GROUPS, SPACE_TYPE.REVIEW])
    })

    it('transforms ["3","4","5"] to correct array', async () => {
      const dto = toInstance({ types: ['3', '4', '5'] })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.types).to.deep.equal([SPACE_TYPE.PRIVATE_TYPE, SPACE_TYPE.GOVERNMENT, SPACE_TYPE.ADMINISTRATOR])
    })

    it('returns a validation error when types contain unknown values', async () => {
      const dto = toInstance({ types: ['0', 'unknown', '1'] })
      const errors = await validate(dto)
      expect(errors).to.have.length.greaterThan(0)
      expect(errors[0].property).to.equal('types')
    })

    it('returns a validation error when all types are invalid', async () => {
      const dto = toInstance({ types: ['999'] })
      const errors = await validate(dto)
      expect(errors).to.have.length.greaterThan(0)
      expect(errors[0].property).to.equal('types')
    })

    it('leaves types undefined when omitted', async () => {
      const dto = toInstance({})
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
      expect(dto.types).to.equal(undefined)
    })
  })
})

describe('CliScopeQueryDTO', () => {
  const toInstance = (plain: Record<string, unknown>): CliScopeQueryDTO =>
    plainToInstance(CliScopeQueryDTO, plain, { enableImplicitConversion: false })

  describe('validation', () => {
    it('passes for scope="private"', async () => {
      const dto = toInstance({ scope: 'private' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
    })

    it('passes for scope="public"', async () => {
      const dto = toInstance({ scope: 'public' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
    })

    it('passes for scope="space-456"', async () => {
      const dto = toInstance({ scope: 'space-456' })
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
    })

    it('fails for scope="invalid"', async () => {
      const dto = toInstance({ scope: 'invalid' })
      const errors = await validate(dto)
      expect(errors).to.have.length.greaterThan(0)
      expect(errors[0].property).to.equal('scope')
    })

    it('fails for scope="space-abc" (non-numeric)', async () => {
      const dto = toInstance({ scope: 'space-abc' })
      const errors = await validate(dto)
      expect(errors).to.have.length.greaterThan(0)
      expect(errors[0].property).to.equal('scope')
    })

    it('passes when scope is omitted', async () => {
      const dto = toInstance({})
      const errors = await validate(dto)
      expect(errors).to.have.length(0)
    })
  })
})
