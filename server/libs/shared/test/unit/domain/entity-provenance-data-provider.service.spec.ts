import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Job } from '@shared/domain/job/job.entity'
import { EntityProvenanceDataProviderService } from '@shared/domain/provenance/service/entity-data/entity-provenance-data-provider.service'
import { EntityProvenanceDataService } from '@shared/domain/provenance/service/entity-data/entity-provenance-data.service'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { User } from '@shared/domain/user/user.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('EntityProvenanceDataProviderService', () => {
  const APP_ID = 0
  const APP = { id: APP_ID } as unknown as App

  const ASSET_1_ID = 1
  const ASSET_1 = { id: ASSET_1_ID } as unknown as Asset
  const ASSET_2_ID = 2
  const ASSET_2 = { id: ASSET_2_ID } as unknown as Asset

  const COMPARISON_ID = 3
  const COMPARISON = { id: COMPARISON_ID } as unknown as Comparison

  const FILE_ID = 4
  const FILE = { id: FILE_ID } as unknown as Comparison

  const JOB_ID = 5
  const JOB = { id: JOB_ID } as unknown as Job

  const USER_ID = 6
  const USER = { id: USER_ID } as unknown as User

  const WORKFLOW_ID = 7
  const WORKFLOW = { id: WORKFLOW_ID } as unknown as Workflow

  const DISCUSSION_ID = 8
  const DISCUSSION = { id: DISCUSSION_ID } as unknown as Discussion

  const appGetDataStub = stub()
  const appGetParentsStub = stub()

  const assetGetDataStub = stub()
  const assetGetParentsStub = stub()

  const comparisonGetDataStub = stub()
  const comparisonGetParentsStub = stub()

  const fileGetDataStub = stub()
  const fileGetParentsStub = stub()

  const jobGetDataStub = stub()
  const jobGetParentsStub = stub()

  const userGetDataStub = stub()
  const userGetParentsStub = stub()

  const workflowGetDataStub = stub()
  const workflowGetParentsStub = stub()

  const discussionGetDataStub = stub()
  const discussionGetParentsStub = stub()

  beforeEach(() => {
    appGetDataStub.reset()
    appGetDataStub.throws()

    appGetParentsStub.reset()
    appGetParentsStub.throws()

    assetGetDataStub.reset()
    assetGetDataStub.throws()

    assetGetParentsStub.reset()
    assetGetParentsStub.throws()

    comparisonGetDataStub.reset()
    comparisonGetDataStub.throws()

    comparisonGetParentsStub.reset()
    comparisonGetParentsStub.throws()

    fileGetDataStub.reset()
    fileGetDataStub.throws()

    fileGetParentsStub.reset()
    fileGetParentsStub.throws()

    jobGetDataStub.reset()
    jobGetDataStub.throws()

    jobGetParentsStub.reset()
    jobGetParentsStub.throws()

    userGetDataStub.reset()
    userGetDataStub.throws()

    userGetParentsStub.reset()
    userGetParentsStub.throws()

    workflowGetDataStub.reset()
    workflowGetDataStub.throws()

    workflowGetParentsStub.reset()
    workflowGetParentsStub.throws()

    discussionGetDataStub.reset()
    discussionGetDataStub.throws()

    discussionGetParentsStub.reset()
    discussionGetParentsStub.throws()
  })
  ;[
    { type: 'app', entity: APP, dataStub: appGetDataStub, parentsStub: appGetParentsStub },
    {
      type: 'asset',
      entity: ASSET_1,
      dataStub: assetGetDataStub,
      parentsStub: assetGetParentsStub,
    },
    {
      type: 'comparison',
      entity: COMPARISON,
      dataStub: comparisonGetDataStub,
      parentsStub: comparisonGetParentsStub,
    },
    { type: 'file', entity: FILE, dataStub: fileGetDataStub, parentsStub: fileGetParentsStub },
    { type: 'job', entity: JOB, dataStub: jobGetDataStub, parentsStub: jobGetParentsStub },
    { type: 'user', entity: USER, dataStub: userGetDataStub, parentsStub: userGetParentsStub },
    {
      type: 'workflow',
      entity: WORKFLOW,
      dataStub: workflowGetDataStub,
      parentsStub: workflowGetParentsStub,
    },
    {
      type: 'discussion',
      entity: DISCUSSION,
      dataStub: discussionGetDataStub,
      parentsStub: discussionGetParentsStub,
    },
  ].forEach((prop) => {
    it(`should use the correct data provider for source type ${prop.type}`, async () => {
      const DATA = 'DATA'
      const PARENTS = []

      prop.dataStub.withArgs(prop.entity).returns(DATA)
      prop.parentsStub.withArgs(prop.entity).resolves(PARENTS)

      const res = await getInstance().getEntityProvenanceData({
        type: prop.type,
        entity: prop.entity,
      })

      expect(res.data).to.equal(DATA)
      expect(res.parents).to.be.undefined()
      expect(prop.parentsStub.calledOnce).to.be.true()
    })
  })

  it('should not catch error from data provider getData', async () => {
    const error = new Error('my error')
    appGetDataStub.reset()
    appGetDataStub.throws(error)

    await expect(
      getInstance().getEntityProvenanceData({ type: 'app', entity: APP }),
    ).to.be.rejectedWith(error)
  })

  it('should not catch error from data provider getParents', async () => {
    appGetDataStub.withArgs(APP).returns('')

    const error = new Error('my error')
    appGetParentsStub.reset()
    appGetParentsStub.throws(error)

    await expect(
      getInstance().getEntityProvenanceData({ type: 'app', entity: APP }),
    ).to.be.rejectedWith(error)
  })

  it('should recursively find all parents', async () => {
    const APP_DATA = 'APP_DATA'
    const APP_PARENTS = [{ type: 'user', entity: USER }]
    appGetDataStub.withArgs(APP).returns(APP_DATA)
    appGetParentsStub.withArgs(APP).resolves(APP_PARENTS)

    const USER_DATA = 'USER_DATA'
    const USER_PARENTS = [
      { type: 'asset', entity: ASSET_1 },
      { type: 'asset', entity: ASSET_2 },
      { type: 'file', entity: FILE },
    ]
    userGetDataStub.withArgs(USER).returns(USER_DATA)
    userGetParentsStub.withArgs(USER).resolves(USER_PARENTS)

    const ASSET_1_DATA = 'ASSET_1_DATA'
    const ASSET_1_PARENTS = [{ type: 'comparison', entity: COMPARISON }]
    assetGetDataStub.withArgs(ASSET_1).returns(ASSET_1_DATA)
    assetGetParentsStub.withArgs(ASSET_1).resolves(ASSET_1_PARENTS)

    const ASSET_2_DATA = 'ASSET_2_DATA'
    const ASSET_2_PARENTS = []
    assetGetDataStub.withArgs(ASSET_2).returns(ASSET_2_DATA)
    assetGetParentsStub.withArgs(ASSET_2).resolves(ASSET_2_PARENTS)

    const FILE_DATA = 'FILE_DATA'
    const FILE_PARENTS = [{ type: 'workflow', entity: WORKFLOW }]
    fileGetDataStub.withArgs(FILE).returns(FILE_DATA)
    fileGetParentsStub.withArgs(FILE).resolves(FILE_PARENTS)

    const COMPARISON_DATA = 'COMPARISON_DATA'
    const COMPARISON_PARENTS = [{ type: 'job', entity: JOB }]
    comparisonGetDataStub.withArgs(COMPARISON).returns(COMPARISON_DATA)
    comparisonGetParentsStub.withArgs(COMPARISON).resolves(COMPARISON_PARENTS)

    const JOB_DATA = 'JOB_DATA'
    const JOB_PARENTS = []
    jobGetDataStub.withArgs(JOB).returns(JOB_DATA)
    jobGetParentsStub.withArgs(JOB).resolves(JOB_PARENTS)

    const WORKFLOW_DATA = 'WORKFLOW_DATA'
    const WORKFLOW_PARENTS = []
    workflowGetDataStub.withArgs(WORKFLOW).returns(WORKFLOW_DATA)
    workflowGetParentsStub.withArgs(WORKFLOW).resolves(WORKFLOW_PARENTS)

    const expected = {
      data: APP_DATA,
      parents: [
        {
          data: USER_DATA,
          parents: [
            {
              data: ASSET_1_DATA,
              parents: [
                {
                  data: COMPARISON_DATA,
                  parents: [
                    {
                      data: JOB_DATA,
                    },
                  ],
                },
              ],
            },
            {
              data: ASSET_2_DATA,
            },
            {
              data: FILE_DATA,
              parents: [
                {
                  data: WORKFLOW_DATA,
                },
              ],
            },
          ],
        },
      ],
    }

    const res = await getInstance().getEntityProvenanceData({ type: 'app', entity: APP })
    expect(res).to.deep.equal(expected)
  })

  function getInstance() {
    const ENTITY_PARENT_RESOLVER_MAP: {
      [T in EntityType]: EntityProvenanceDataService<T>
    } = {
      app: {
        getData: appGetDataStub,
        getParents: appGetParentsStub,
      },
      asset: {
        getData: assetGetDataStub,
        getParents: assetGetParentsStub,
      },
      comparison: {
        getData: comparisonGetDataStub,
        getParents: comparisonGetParentsStub,
      },
      file: {
        getData: fileGetDataStub,
        getParents: fileGetParentsStub,
      },
      job: {
        getData: jobGetDataStub,
        getParents: jobGetParentsStub,
      },
      user: {
        getData: userGetDataStub,
        getParents: userGetParentsStub,
      },
      workflow: {
        getData: workflowGetDataStub,
        getParents: workflowGetParentsStub,
      },
      discussion: {
        getData: discussionGetDataStub,
        getParents: discussionGetParentsStub,
      },
    }
    return new EntityProvenanceDataProviderService(ENTITY_PARENT_RESOLVER_MAP)
  }
})
