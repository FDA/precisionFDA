import { App } from '@shared/domain/app/app.entity'
import { UIdScopedEntityLinkProvider } from '@shared/domain/entity/entity-link/u-id-scoped-entity-link-provider'
import { Job } from '@shared/domain/job/job.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Workflow } from '@shared/domain/workflow/entity/workflow.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { EntityUtils } from '@shared/utils/entity.utils'
import { expect } from 'chai'
import { match, SinonStub, stub } from 'sinon'

describe('UIdScopedEntityLinkProvider', () => {
  const UID = 'UID'

  let getEntityTypeForEntityStub: SinonStub

  beforeEach(() => {
    getEntityTypeForEntityStub = stub(EntityUtils, 'getEntityTypeForEntity').throws()
  })

  afterEach(() => {
    getEntityTypeForEntityStub.restore()
  })

  describe('private scoped', async () => {
    assertStaticScope(STATIC_SCOPE.PRIVATE)
  })

  describe('public scoped', async () => {
    assertStaticScope(STATIC_SCOPE.PUBLIC)
  })

  describe('space scoped', async () => {
    const SPACE_ID = 1
    const SCOPE = `space-${SPACE_ID}`

    it(`should provide correct relative links`, async () => {
      const cases = prepareTestCases(SCOPE)

      for (const { entity, urlSegment } of cases) {
        const res = await getInstance().getLink(entity, { absolute: false })

        expect(res).to.equal(`/spaces/${SPACE_ID}/${urlSegment}/${entity.uid}`)
      }
    })

    it(`should provide correct absolute links`, async () => {
      const cases = prepareTestCases(SCOPE)

      for (const { entity, urlSegment } of cases) {
        const res = await getInstance().getLink(entity)

        expect(res).to.equal(
          `https://rails-host:1234/spaces/${SPACE_ID}/${urlSegment}/${entity.uid}`,
        )
      }
    })
  })

  function assertStaticScope(scope: SCOPE) {
    it(`should provide correct relative link`, async () => {
      const cases = prepareTestCases(scope)

      for (const { entity, urlSegment } of cases) {
        const res = await getInstance().getLink(entity, { absolute: false })

        expect(res).to.equal(`/home/${urlSegment}/${UID}`)
      }
    })

    it(`should provide correct relative link`, async () => {
      const cases = prepareTestCases(scope)

      for (const { entity, urlSegment } of cases) {
        const res = await getInstance().getLink(entity)

        expect(res).to.equal(`https://rails-host:1234/home/${urlSegment}/${UID}`)
      }
    })
  }

  function prepareTestCases(scope: SCOPE) {
    const APP = { uid: UID, scope } as unknown as App
    const ASSET = { uid: UID, scope } as unknown as Asset
    const JOB = { uid: UID, scope } as unknown as Job
    const FILE = { uid: UID, scope } as unknown as UserFile
    const WORKFLOW = { uid: UID, scope } as unknown as Workflow

    getEntityTypeForEntityStub.withArgs(match.same(APP)).returns('app')
    getEntityTypeForEntityStub.withArgs(match.same(ASSET)).returns('asset')
    getEntityTypeForEntityStub.withArgs(match.same(JOB)).returns('job')
    getEntityTypeForEntityStub.withArgs(match.same(FILE)).returns('file')
    getEntityTypeForEntityStub.withArgs(match.same(WORKFLOW)).returns('workflow')

    return [
      { entity: APP, urlSegment: 'apps' },
      { entity: ASSET, urlSegment: 'assets' },
      { entity: JOB, urlSegment: 'executions' },
      { entity: FILE, urlSegment: 'files' },
      { entity: WORKFLOW, urlSegment: 'workflows' },
    ]
  }

  function getInstance() {
    return new UIdScopedEntityLinkProvider()
  }
})
