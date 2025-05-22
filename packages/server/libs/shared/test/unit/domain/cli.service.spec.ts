import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { User } from '@shared/domain/user/user.entity'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { database } from '@shared/database'
import { create } from '@shared/test'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { SinonStub, stub } from 'sinon'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'

describe('CliService tests', () => {
  let user: User
  let em: EntityManager<MySqlDriver>

  let getPasswordStub: SinonStub
  let rotatePasswordStub: SinonStub

  beforeEach(async () => {
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    await em.flush()

    getPasswordStub = stub().throws()
    rotatePasswordStub = stub().throws()
  })

  it('should be defined', () => {
    const cliService = getInstance()
    expect(cliService).to.be.not.undefined
  })

  //TODO: PFDA-6328 add tests for job scope

  context('managing DbCluster password', () => {
    it('should get password for dbcluster', async () => {
      getPasswordStub.resolves('password')

      const psw = await getInstance().dbClusterGetPassword('dbcluster-xxx-1')
      expect(psw).to.be.equal('password')
      expect(getPasswordStub.calledOnce).to.be.true()
    })

    it('should rotate password', async () => {
      rotatePasswordStub.resolves('new-password')

      const psw = await getInstance().dbClusterRotatePassword('dbcluster-xxx-1')
      expect(psw).to.be.equal('new-password')
      expect(rotatePasswordStub.calledOnce).to.be.true()
    })
  })

  function getInstance() {
    const userCtx = new UserContext(user.id, 'accessToken', user.dxuser, null)
    const discussionService = {} as unknown as DiscussionService
    const dbClusterService = {
      getPassword: getPasswordStub,
      rotatePassword: rotatePasswordStub,
    } as unknown as DbClusterService

    return new CliService(em, userCtx, dbClusterService, discussionService)
  }
})
