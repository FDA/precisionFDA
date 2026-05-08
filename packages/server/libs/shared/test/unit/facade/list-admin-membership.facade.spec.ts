import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { AdminMembershipPaginationDTO } from '@shared/domain/admin-membership/dto/admin-membership-pagination.dto'
import { UserWithAdminRolesDTO } from '@shared/domain/admin-membership/dto/user-with-admin-roles.dto'
import { UserService } from '@shared/domain/user/service/user.service'
import { User } from '@shared/domain/user/user.entity'
import { ListAdminMembershipFacade } from '@shared/facade/admin-membership/list-admin-membership.facade'

describe('ListAdminMembershipFacade', () => {
  const paginateUsersWithAdminRolesStub = stub()
  let fromEntityStub: SinonStub

  const userService = {
    paginateUsersWithAdminRoles: paginateUsersWithAdminRolesStub,
  } as unknown as UserService

  beforeEach(() => {
    paginateUsersWithAdminRolesStub.reset()
    paginateUsersWithAdminRolesStub.throws()

    fromEntityStub = stub(UserWithAdminRolesDTO, 'fromEntity')
    fromEntityStub.throws()
  })

  afterEach(() => {
    fromEntityStub.restore()
  })

  function getInstance(): ListAdminMembershipFacade {
    return new ListAdminMembershipFacade(userService)
  }

  describe('#listUsersWithRoles', () => {
    it('maps users to DTOs and returns paginated result', async () => {
      const query = { page: 1, pageSize: 10 } as unknown as AdminMembershipPaginationDTO
      const user1 = { id: 1, dxuser: 'user1' } as unknown as User
      const user2 = { id: 2, dxuser: 'user2' } as unknown as User
      const dto1 = { id: 1, dxuser: 'user1', adminRoles: [] } as unknown as UserWithAdminRolesDTO
      const dto2 = { id: 2, dxuser: 'user2', adminRoles: [] } as unknown as UserWithAdminRolesDTO
      const meta = { total: 2, totalPages: 1, pageSize: 10, page: 1 }

      paginateUsersWithAdminRolesStub.withArgs(query).resolves({ data: [user1, user2], meta })
      fromEntityStub.withArgs(user1).returns(dto1)
      fromEntityStub.withArgs(user2).returns(dto2)

      const facade = getInstance()
      const result = await facade.listUsersWithRoles(query)

      expect(result.data).to.deep.equal([dto1, dto2])
      expect(result.meta).to.deep.equal(meta)
      expect(fromEntityStub.callCount).to.equal(2)
    })

    it('returns empty data array when no users found', async () => {
      const query = { page: 1, pageSize: 10 } as unknown as AdminMembershipPaginationDTO
      const meta = { total: 0, totalPages: 0, pageSize: 10, page: 1 }

      paginateUsersWithAdminRolesStub.withArgs(query).resolves({ data: [], meta })

      const facade = getInstance()
      const result = await facade.listUsersWithRoles(query)

      expect(result.data).to.deep.equal([])
      expect(result.meta).to.deep.equal(meta)
      expect(fromEntityStub.callCount).to.equal(0)
    })
  })
})
