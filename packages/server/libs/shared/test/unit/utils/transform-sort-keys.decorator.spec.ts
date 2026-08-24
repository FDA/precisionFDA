import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { TransformSortKeys } from '@shared/utils/transformers/transform-sort-keys.decorator'

class TestPaginationDTO {
  @TransformSortKeys({ addedBy: 'user.dxuser', location: 'location' })
  sort?: unknown
}

describe('TransformSortKeys', () => {
  it('remaps aliases to nested ORM paths and preserves unmapped keys', () => {
    const dto = plainToInstance(TestPaginationDTO, {
      sort: { addedBy: 'ASC', createdAt: 'DESC' },
    })

    expect(dto.sort).to.deep.equal({
      user: { dxuser: 'ASC' },
      createdAt: 'DESC',
    })
  })

  it('supports aliases mapped to a top-level ORM property', () => {
    const dto = plainToInstance(TestPaginationDTO, {
      sort: { location: 'DESC' },
    })

    expect(dto.sort).to.deep.equal({ location: 'DESC' })
  })

  it('passes through non-object sort values', () => {
    expect(plainToInstance(TestPaginationDTO, { sort: undefined }).sort).to.equal(undefined)
    expect(plainToInstance(TestPaginationDTO, { sort: null }).sort).to.equal(null)
    expect(plainToInstance(TestPaginationDTO, { sort: 'createdAt' }).sort).to.equal('createdAt')
  })
})
