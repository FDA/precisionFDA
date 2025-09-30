import { SqlEntityManager } from '@mikro-orm/mysql'

import { GeneralProperty } from '@shared/domain/property/property.entity'
import { PropertyService } from '@shared/domain/property/services/property.service'
import { User } from '@shared/domain/user/user.entity'

import { expect } from 'chai'
import { PropertyRepository } from '@shared/domain/property/property.repository'
import sinon, { stub } from 'sinon'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeProperty } from '@shared/domain/property/node-property.entity'

describe('property service tests', () => {
  let user: User
  let userCtx: UserContext

  const findStub = stub()

  const transactionalStub = sinon.stub()
  const removeStub = sinon.stub()
  const persistStub = sinon.stub()
  const createStub = sinon.stub()
  const em = {
    persist: persistStub,
    transactional: transactionalStub,
    removeAndFlush: removeStub,
    create: createStub,
  } as unknown as SqlEntityManager

  const propertyRepo = {
    find: findStub,
  } as unknown as PropertyRepository

  beforeEach(async () => {
    user = { id: 1 } as User
    userCtx = { ...user, accessToken: 'superSecretToken' } as unknown as UserContext

    findStub.reset()
    findStub.throws()

    removeStub.reset()
    removeStub.throws()

    persistStub.reset()
    persistStub.throws()

    createStub.reset()
    createStub.throws()

    transactionalStub.callsFake(async (callback) => {
      return callback(em)
    })
  })

  it('save new properties for an owned file', async () => {
    const propertyService = getInstance(userCtx)

    // return two node properties when finding for node with id 1
    findStub.withArgs({ targetType: 'node', targetId: 1 }).resolves([] as NodeProperty[])
    removeStub.resolves()
    createStub.resolves()
    persistStub.resolves()

    await propertyService.setProperty({
      targetType: 'node',
      targetId: 1,
      properties: { stage: 'final', language: 'python' },
    })

    expect(findStub.calledOnce).to.be.true()
    expect(removeStub.calledOnce).to.be.true()
    expect(createStub.calledTwice).to.be.true()
    expect(createStub.firstCall.args[0]).to.equal(GeneralProperty)
    expect(createStub.firstCall.args[1]).to.deep.equal({
      targetId: 1,
      targetType: 'node',
      propertyName: 'stage',
      propertyValue: 'final',
    })
    expect(createStub.secondCall.args[0]).to.equal(GeneralProperty)
    expect(createStub.secondCall.args[1]).to.deep.equal({
      targetId: 1,
      targetType: 'node',
      propertyName: 'language',
      propertyValue: 'python',
    })
    expect(persistStub.calledOnce).to.be.true()
  })

  function getInstance(ctx: UserContext): PropertyService {
    return new PropertyService(em, ctx, propertyRepo)
  }
})
