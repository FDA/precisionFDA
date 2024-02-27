import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { Job } from '@shared/domain/job/job.entity'
import { PropertyType } from '@shared/domain/property/property.entity'
import { PropertyService } from '@shared/domain/property/services/property.service'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { create, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { SCOPE } from '@shared/types/common'
import { mocksReset as localMocksReset } from '@worker-test/utils/mocks'
import { expect } from 'chai'


describe('property service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let file: UserFile

  beforeEach(async () => {
    await db.dropData(database.connection())
    //@ts-ignore
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    file = create.filesHelper.create(em, { user }, { name: 'file-with-properties' })
    await em.flush()
    userCtx = { ...user, accessToken: 'superSecretToken' }

    mocksReset()
    localMocksReset()
  })

  it('save properties - all types of target', async () => {
    const propertyService = new PropertyService(em, userCtx)
    const asset = create.assetHelper.create(em, { user })
    const app = create.appHelper.createRegular(em, { user })
    const appSeries = create.appSeriesHelper.create(em, { user }, {})
    const spec = '{"input_spec": {"stages": [{"app_uid": "'
      + `${app.uid}"},{"app_uid": "${app.uid}"}]}}`
    const workflow = create.workflowHelper.create(em, { user }, { spec })
    const workflowSeries = create.workflowSeriesHelper.create(em, { user }, {})
    const job = create.jobHelper.create(em, { user })
    const dbCluster = create.dbClusterHelper.create(em, { user })
    await em.flush()

    expect(await asset.properties.loadItems()).to.have.length(0)

    const fileInput = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'stage': 'final',
      },
    }
    const assetInput = {
      targetId: asset.id,
      targetType: 'node' as PropertyType,
      properties: {
        'stage': 'final',
        'type': 'general asset',
      },
    }
    const workflowSeriesInput = {
      targetId: workflowSeries.id,
      targetType: 'workflowSeries' as PropertyType,
      properties: {
        'stage': 'final',
      },
    }

    const jobInput = {
      targetId: job.id,
      targetType: 'job' as PropertyType,
      properties: {
        'stage': 'final',
        'type': 'general job',
      },
    }
    const dbClusterInput = {
      targetId: dbCluster.id,
      targetType: 'dbCluster' as PropertyType,
      properties: {
        'stage': 'final',
      },
    }
    const appSeriesInput = {
      targetId: appSeries.id,
      targetType: 'appSeries' as PropertyType,
      properties: {
        'stage': 'final',
        'type': 'general app',
      },
    }

    await propertyService.setProperty(fileInput)
    await propertyService.setProperty(assetInput)
    await propertyService.setProperty(workflowSeriesInput)
    await propertyService.setProperty(jobInput)
    await propertyService.setProperty(dbClusterInput)
    await propertyService.setProperty(appSeriesInput)

    em.clear()

    const loadedNode = await em.findOneOrFail(Node, { id: file.id }, { populate: ['properties'] })
    const loadedAppSeries = await em.findOneOrFail(AppSeries, { id: app.id }, { populate: ['properties'] })
    const loadedAsset = await em.findOneOrFail(Asset, { id: asset.id }, { populate: ['properties'] })
    const loadedWorkflowSeries = await em.findOneOrFail(WorkflowSeries, { id: workflow.id }, { populate: ['properties'] })
    const loadedJob = await em.findOneOrFail(Job, { id: job.id }, { populate: ['properties'] })
    const loadedDbCluster = await em.findOneOrFail(DbCluster, { id: dbCluster.id }, { populate: ['properties'] })

    expect(loadedNode.properties.getItems()).to.have.length(1)
    expect(loadedAppSeries.properties.getItems()).to.have.length(2)
    expect(loadedAsset.properties.getItems()).to.have.length(2)
    expect(loadedWorkflowSeries.properties.getItems()).to.have.length(1)
    expect(loadedJob.properties.getItems()).to.have.length(2)
    expect(loadedDbCluster.properties.getItems()).to.have.length(1)
  })


  it('save properties - owner of target', async () => {
    const propertyService = new PropertyService(em, userCtx)
    const input = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    await propertyService.setProperty(input)
    em.clear()
    const loadedNode = await em.findOneOrFail(Node,
      { id: file.id },
      { populate: ['properties'] },
    )

    const savedProperties = loadedNode.properties.getItems()

    expect(loadedNode.id).to.equal(file.id)
    expect(savedProperties).to.have.length(3)
    expect(savedProperties[0]).to.contain({
      targetId: 1,
      targetType: 'node',
      propertyName: 'language',
      propertyValue: 'python',
    })
    expect(savedProperties[2]).to.contain({
      targetId: 1,
      targetType: 'node',
      propertyName: 'version',
      propertyValue: '3',
    })
    expect(savedProperties[1]).to.contain({
      targetId: 1,
      targetType: 'node',
      propertyName: 'stage',
      propertyValue: 'final',
    })
  })

  it('save properties - owner add to existing target properties', async () => {
    const propertyService = new PropertyService(em, userCtx)
    const input = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    await propertyService.setProperty(input)
    em.clear()
    const newInput = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
        'target': 'TBD',
      },
    }
    await propertyService.setProperty(newInput)


    em.clear()
    const loadedNode = await em.findOneOrFail(Node,
      { id: file.id },
      { populate: ['properties'] },
    )

    const savedProperties = loadedNode.properties.getItems()
    expect(loadedNode.id).to.equal(file.id)
    expect(savedProperties).to.have.length(4)
    expect(savedProperties[2]).to.contain({
      targetId: 1,
      targetType: 'node',
      propertyName: 'target',
      propertyValue: 'TBD',
    })
  })

  it('save properties - owner remove from existing target properties', async () => {
    const propertyService = new PropertyService(em, userCtx)
    const input = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    await propertyService.setProperty(input)

    em.clear()
    const newInput = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
      },
    }
    await propertyService.setProperty(newInput)

    em.clear()
    const loadedNode = await em.findOneOrFail(Node,
      { id: file.id },
      { populate: ['properties'] },
    )

    const savedProperties = loadedNode.properties.getItems()

    expect(loadedNode.id).to.equal(file.id)
    expect(savedProperties).to.have.length(2)

  })

  it('save properties - owner change existing target properties', async () => {
    const propertyService = new PropertyService(em, userCtx)
    const input = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    await propertyService.setProperty(input)

    em.clear()
    const newInput = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'Java',
        'version': '17',
        'stage': 'final',
      },
    }
    await propertyService.setProperty(newInput)

    em.clear()
    const loadedNode = await em.findOneOrFail(Node,
      { id: file.id },
      { populate: ['properties'] },
    )

    const savedProperties = loadedNode.properties.getItems()

    expect(loadedNode.id).to.equal(file.id)
    expect(savedProperties).to.have.length(3)
    expect(savedProperties[0]).to.contain({
      targetId: 1,
      targetType: 'node',
      propertyName: 'language',
      propertyValue: 'Java',
    })
    expect(savedProperties[2]).to.contain({
      targetId: 1,
      targetType: 'node',
      propertyName: 'version',
      propertyValue: '17',
    })
    expect(savedProperties[1]).to.contain({
      targetId: 1,
      targetType: 'node',
      propertyName: 'stage',
      propertyValue: 'final',
    })

  })

  it('save properties - target from space and user does have sufficient permissions', async () => {
    const space = create.spacesHelper.create(em, { name: 'test-space' })
    const notOwner = create.userHelper.create(em)
    await em.flush()
    const spaceFile = create.filesHelper.create(em, { user }, { scope: 'space-' + space.id as SCOPE })
    create.spacesHelper.addMember(em, {
      user: notOwner,
      space,
    }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
    await em.flush()

    let propertyService = new PropertyService(em, { ...notOwner, accessToken: 'secretToken' })
    const input = {
      targetId: spaceFile.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }

    await propertyService.setProperty(input)
    em.clear()
    const loadedNode = await em.findOneOrFail(Node,
      { id: spaceFile.id },
      { populate: ['properties'] },
    )

    const savedProperties = loadedNode.properties.getItems()

    expect(loadedNode.id).to.equal(spaceFile.id)
    expect(savedProperties).to.have.length(3)

  })

  it('save properties - public target and user does have sufficient permissions', async () => {
    const publicFile = create.filesHelper.create(em, { user }, { scope: STATIC_SCOPE.PUBLIC })
    const notOwnerButAdmin = create.userHelper.createSiteAdmin(em)
    await em.flush()

    const propertyService = new PropertyService(em, {
      ...notOwnerButAdmin,
      accessToken: 'secretToken',
    })
    const input = {
      targetId: publicFile.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    await propertyService.setProperty(input)
    em.clear()
    const loadedNode = await em.findOneOrFail(Node,
      { id: publicFile.id },
      { populate: ['properties'] },
    )

    const savedProperties = loadedNode.properties.getItems()

    expect(loadedNode.id).to.equal(publicFile.id)
    expect(savedProperties).to.have.length(3)

  })

  it('fail save properties - not owner of private target', async () => {
    let propertyService = new PropertyService(em, userCtx)
    const input = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    await propertyService.setProperty(input)

    const notOwner = create.userHelper.create(em)
    propertyService = new PropertyService(em, { ...notOwner, accessToken: 'secretToken' })
    try {
      await propertyService.setProperty(input)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).to.equal('Error: You do have permissions to access this entity')
    }
  })

  it('fail save properties - public target and user does not have sufficient permissions', async () => {
    const publicFile = create.filesHelper.create(em, { user }, { scope: STATIC_SCOPE.PUBLIC })
    const notOwner = create.userHelper.create(em)
    await em.flush()

    const propertyService = new PropertyService(em, { ...notOwner, accessToken: 'secretToken' })
    const input = {
      targetId: publicFile.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    try {
      await propertyService.setProperty(input)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).to.equal('Error: You do have permissions to access this entity')
    }
  })

  it('fail save properties - target from space and user does not have sufficient permissions', async () => {
    const space = create.spacesHelper.create(em, { name: 'test-space' })
    const notOwner = create.userHelper.create(em)
    await em.flush()

    const spaceFile = create.filesHelper.create(em, { user }, { scope: 'space-' + space.id as SCOPE })
    create.spacesHelper.addMember(em, {
      user: notOwner,
      space,
    }, { role: SPACE_MEMBERSHIP_ROLE.VIEWER })
    await em.flush()

    const propertyService = new PropertyService(em, { ...notOwner, accessToken: 'secretToken' })
    const input = {
      targetId: spaceFile.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    try {
      await propertyService.setProperty(input)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).to.equal('Error: You do have permissions to access this entity')
    }
  })

  it('get valid keys - own private target', async () => {
    const anotherUser = create.userHelper.create(em)
    // await em.flush()

    const file1 = create.filesHelper.create(em, { user })
    const file2 = create.filesHelper.createUploaded(em, { user })
    const folder3 = create.filesHelper.createFolder(em, { user })
    const file4 = create.filesHelper.create(em, { user }, { scope: STATIC_SCOPE.PUBLIC })
    const file5 = create.filesHelper.create(em, { user: anotherUser })
    await em.flush()

    let propertyService = new PropertyService(em, userCtx)
    const input = {
      targetId: file.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'version': '3',
        'stage': 'final',
      },
    }
    const input1 = {
      targetId: file1.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'java',
        'purpose': 'love',
      },
    }
    const input2 = {
      targetId: file2.id,
      targetType: 'node' as PropertyType,
      properties: {
        'language': 'python',
        'deprecated': 'true',
      },
    }
    const input3 = {
      targetId: folder3.id,
      targetType: 'node' as PropertyType,
      properties: {
        'isLeaf': 'false',
        'children': '3',
      },
    }
    const input4 = {
      targetId: file4.id,
      targetType: 'node' as PropertyType,
      properties: {
        'stage': 'initial',
      },
    }

    const input5 = {
      targetId: file5.id,
      targetType: 'node' as PropertyType,
      properties: {
        'type': 'data',
        'normalized': 'false',
      },
    }

    await propertyService.setProperty(input)
    await propertyService.setProperty(input1)
    await propertyService.setProperty(input2)
    await propertyService.setProperty(input3)
    await propertyService.setProperty(input4)
    const propertyServiceAnotherUser = new PropertyService(em, {
      ...anotherUser,
      accessToken: 'secretToken',
    })
    await propertyServiceAnotherUser.setProperty(input5)

    // check valid keys only are returned (only from private files, no duplicates)
    const res = await propertyService.getValidKeys(STATIC_SCOPE.PRIVATE, 'node')
    expect(res).to.have.length(7)
    expect(res).to.contain('language')
    expect(res).to.contain('version')
    expect(res).to.contain('stage')
    expect(res).to.contain('purpose')
    expect(res).to.contain('deprecated')
    expect(res).to.contain('isLeaf')
    expect(res).to.contain('children')

    expect(res).to.not.contain('type')
    expect(res).to.not.contain('normalized')
  })

})
