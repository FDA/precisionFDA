import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { expect } from 'chai'
import { IsDate, IsOptional } from 'class-validator'
import { ToOptionalDate } from '../../../src/validation/decorators/to-optional-date.decorator'

class DummyDateQueryDTO {
  @IsOptional()
  @ToOptionalDate()
  @IsDate()
  from?: Date
}

describe('ToOptionalDate decorator', () => {
  it('transforms valid date string to Date', () => {
    const dto = plainToInstance(DummyDateQueryDTO, { from: '2026-04-01T00:00:00.000Z' })

    const errors = validateSync(dto)

    expect(errors).to.have.length(0)
    expect(dto.from).to.be.instanceOf(Date)
    expect(dto.from?.toISOString()).to.equal('2026-04-01T00:00:00.000Z')
  })

  it('maps invalid date string to undefined', () => {
    const dto = plainToInstance(DummyDateQueryDTO, { from: 'invalid-date' })

    const errors = validateSync(dto)

    expect(errors).to.have.length(0)
    expect(dto.from).to.equal(undefined)
  })
})
