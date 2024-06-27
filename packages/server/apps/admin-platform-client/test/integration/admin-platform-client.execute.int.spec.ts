import axios from 'axios'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import supertest from 'supertest'
import { testedApp } from '../index'

describe('AdminPlatformClientIntegration', () => {
  let requestStub: SinonStub

  beforeEach(() => {
    requestStub = stub(axios, 'request')
    requestStub.throws()
  })

  afterEach(() => {
    requestStub.restore()
  })

  it('should fail when no method provided', async () => {
    const { body } = await supertest(testedApp.getHttpServer()).post('/execute').send().expect(400)

    expect(body.error.code).to.eq('E_VALIDATION')
  })

  it('should fail when non existing method provided', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post('/execute')
      .send({ method: 'foo' })
      .expect(400)

    expect(body.message).to.eq('Invalid method')
  })

  it('should fail with not allowed method provided', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post('/execute')
      .send({ method: 'jobCreate' })
      .expect(403)

    expect(body.message).to.eq(
      'Method "jobCreate" is not allowed to be called on the admin platform client',
    )
  })

  it('should call platform api and return the result', async () => {
    const HANDLE = 'HANDLE'
    const NAME = 'NAME'
    const RESULT = { result: 'SUCCESS' }

    requestStub
      .withArgs({
        method: 'POST',
        data: { handle: HANDLE, name: NAME },
        url: 'https://stagingapi.dnanexus.com/org/new',
        headers: { authorization: 'Bearer MOCKED_ADMIN_TOKEN' },
      })
      .resolves({ data: RESULT })

    const { body } = await supertest(testedApp.getHttpServer())
      .post('/execute')
      .send({ method: 'createOrg', params: [HANDLE, NAME] })
      .expect(200)

    expect(requestStub.calledOnce).to.be.true()
    expect(body).to.deep.eq(RESULT)
  })
})
