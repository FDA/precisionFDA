import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import P from 'pino'
import { User } from 'shared/src/domain'
import { ClassIdResponse, PlatformClient } from '../../../../platform-client'
import { expect } from 'chai'
import { OrgService } from '../../../../domain/org/service/org.service'

describe('org service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: P.Logger
  let userCtx: types.UserCtx
  let adminPlatformClient: PlatformClient
  let userPlatformClient: PlatformClient
  let createOrgHandleParam: string
  let createOrgNameParam: string
  let describeDxidParam: string
  let orgIdParam: string
  let billingInfoParam: string
  const orgHandle = 'pfda..space_host_86cfee2ccf'
  const orgId = `org-${orgHandle}`

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = {...user, accessToken: 'foo'}

    // just simulate that the org was not found
    adminPlatformClient = {
      async objectDescribe(dxid: string): Promise<ClassIdResponse> {
        describeDxidParam = dxid
        throw new Error()
      },
      async createOrg(handle: string, name: string): Promise<any> {
        createOrgHandleParam = handle
        createOrgNameParam = name
        return 'org-handle'
      }
    } as PlatformClient
    userPlatformClient = {
      async updateBillingInformation(orgDxid: string, billingInfo: any): Promise<any> {
        orgIdParam = orgDxid
        billingInfoParam = billingInfo
      }
    } as PlatformClient
  })

  it('test create orgs', async () => {
    const service = new OrgService(em, adminPlatformClient, userPlatformClient)

    const result = await service.create(orgId, false)

    expect(result).eq('org-handle')
    expect(describeDxidParam).eq(orgId)
    expect(createOrgNameParam).eq(orgHandle)
    expect(createOrgHandleParam).eq(orgHandle)
  })

  it('test create orgs - fail already exists', async () => {
    // just simulate that the org was found
    adminPlatformClient = {
      async objectDescribe(dxid: string): Promise<ClassIdResponse> {
        return {id: 'orgId'}
      },
    } as PlatformClient

    const service = new OrgService(em, adminPlatformClient, userPlatformClient)

    try {
      await service.create(orgId, false)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal(`Org with dxid ${orgId} already exists`)
      expect(describeDxidParam).eq(orgId)
    }
  })

  it('test create orgs with billable', async () => {
    const service = new OrgService(em, adminPlatformClient, userPlatformClient)

    const result = await service.create(orgId, true)

    expect(result).eq('org-handle')
    expect(describeDxidParam).eq(orgId)
    expect(createOrgNameParam).eq(orgHandle)
    expect(createOrgHandleParam).eq(orgHandle)
    expect(orgIdParam).eq('org-handle')
    expect(billingInfoParam.email).eq('billing@dnanexus.com')
  })

})
