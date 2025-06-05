import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { OrgService } from '@shared/domain/org/service/org.service'
import { PlatformClient } from '@shared/platform-client'
import {
  ClassIdResponse,
  UpdateBillingInformationResponse,
} from '@shared/platform-client/platform-client.responses'
import { expect } from 'chai'
import { db } from '../../../src/test'

describe('org service tests', () => {
  let em: EntityManager<MySqlDriver>
  let adminPlatformClient: PlatformClient
  let userPlatformClient: PlatformClient
  let createOrgHandleParam: string
  let createOrgNameParam: string
  let describeDxidParam: string
  let orgIdParam: string
  const orgHandle = 'pfda..space_host_86cfee2ccf'
  const orgId = `org-${orgHandle}`

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    await em.flush()

    // just simulate that the org was not found
    adminPlatformClient = {
      async objectDescribe(dxid: string): Promise<ClassIdResponse> {
        describeDxidParam = dxid
        throw new Error()
      },
      async createOrg(handle: string, name: string): Promise<ClassIdResponse> {
        createOrgHandleParam = handle
        createOrgNameParam = name
        return { id: 'org-handle' }
      },
    } as PlatformClient
    userPlatformClient = {
      async updateBillingInformation(orgDxid: string): Promise<UpdateBillingInformationResponse> {
        orgIdParam = orgDxid
        return {
          message: 'Billing information has been forcibly set.',
          status: 'BillingInfoForceSet',
        }
      },
    } as PlatformClient
  })

  it('test create orgs', async () => {
    const service = new OrgService(em, adminPlatformClient, userPlatformClient)

    const result = await service.create(orgId, false)

    expect(result.id).eq('org-handle')
    expect(describeDxidParam).eq(orgId)
    expect(createOrgNameParam).eq(orgHandle)
    expect(createOrgHandleParam).eq(orgHandle)
  })

  it('test create orgs - fail already exists', async () => {
    // just simulate that the org was found
    adminPlatformClient = {
      async objectDescribe(): Promise<ClassIdResponse> {
        return { id: 'org-Id' }
      },
    } as PlatformClient

    const service = new OrgService(em, adminPlatformClient, userPlatformClient)

    try {
      await service.create(orgId, false)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to.equal(`Org with dxid ${orgId} already exists`)
      expect(describeDxidParam).eq(orgId)
    }
  })

  it('test create orgs with billable', async () => {
    const service = new OrgService(em, adminPlatformClient, userPlatformClient)

    const result = await service.create(orgId, true)

    expect(result.id).eq('org-handle')
    expect(describeDxidParam).eq(orgId)
    expect(createOrgNameParam).eq(orgHandle)
    expect(createOrgHandleParam).eq(orgHandle)
    expect(orgIdParam).eq('org-handle')
  })
})
