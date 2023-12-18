import { expect } from 'chai'
import { User } from '../../../src/domain'
import {
  UserProvenanceDataService,
} from '../../../src/domain/provenance/service/entity-data/user-provenance-data.service'

describe('UserProvenanceDataService', () => {
  const FULL_NAME = 'full name'
  const DX_USER = 'dxuser'

  const USER = {
    fullName: FULL_NAME,
    dxuser: DX_USER,
  } as unknown as User

  describe('#getData', () => {
    it('should provide correct data about the user', () => {
      const res = getInstance().getData(USER)

      expect(res).to.deep.equal({ type: 'user', url: `https://rails-host:1234/users/${DX_USER}`, title: FULL_NAME })
    })
  })

  describe('#getParents', () => {
    it('should return no parents', async () => {
      const res = await getInstance().getParents()

      expect(res).to.be.an('array').and.to.be.empty()
    })
  })

  function getInstance() {
    return new UserProvenanceDataService()
  }
})
