import { mapToUser } from './UserShape'


describe('mapToUser()', () => {
  it('returns null if no user given', () => {
    expect(mapToUser(undefined)).toEqual(null)
  })

  it('returns valid user object', () => {
    const userData = {
      name: 'some name',
      org: 'some org',
      user_url: 'some url',
      some_field: 'some field',
    }

    expect(mapToUser(userData)).toEqual({
      name: 'some name',
      org: 'some org',
      url: 'some url',
    })
  })
})
