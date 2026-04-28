import { expect } from 'chai'
import { validate } from 'class-validator'
import { UpdateTimezoneDTO } from '@shared/domain/user/dto/update-timezone.dto'

describe('UpdateTimezoneDTO', () => {
  it('accepts valid IANA timezones', async () => {
    const validTimeZones = [
      'UTC',
      'Europe/Prague',
      'Europe/London',
      'America/New_York',
      'America/Los_Angeles',
      'America/Sao_Paulo',
      'Asia/Tokyo',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Africa/Johannesburg',
    ]

    for (const timeZone of validTimeZones) {
      const dto = new UpdateTimezoneDTO()
      dto.timeZone = timeZone

      const errors = await validate(dto)
      expect(errors, `Expected ${timeZone} to be accepted`).to.have.length(0)
    }
  })

  it('rejects an invalid timezone string', async () => {
    const dto = new UpdateTimezoneDTO()
    dto.timeZone = 'not-a-timezone'

    const errors = await validate(dto)

    expect(errors).to.have.length.greaterThan(0)
    expect(errors[0].property).to.equal('timeZone')
  })
})
