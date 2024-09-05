import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportResultJsonProvider } from '@shared/domain/space-report/service/result/space-report-result-json.provider'
import { Space } from '@shared/domain/space/space.entity'
import { expect } from 'chai'
import { SinonSpy, spy, stub } from 'sinon'

describe('SpaceReportResultJsonProvider', () => {
  const REPORT_ID = 0
  const REPORT_CREATED = new Date('2023-09-01T14:58:08.000Z')

  const SPACE_ID = 10
  const SPACE_NAME = 'space name'
  const SPACE_DESCRIPTION = 'space description'
  const SPACE_SCOPE = `space-${SPACE_ID}`
  const SPACE = {
    id: SPACE_ID,
    scope: SPACE_SCOPE,
    name: SPACE_NAME,
    description: SPACE_DESCRIPTION,
    isConfidentialReviewerSpace: () => false,
    isConfidentialSponsorSpace: () => false,
  } as unknown as Space

  const CREATED_BY_FULL_NAME = 'CREATED_BY_FULL_NAME'
  const CREATED_BY = {
    getEntity: () => ({ fullName: CREATED_BY_FULL_NAME }),
  }

  const REPORT_PART_1_ID = 10
  const REPORT_PART_1_TITLE = 'title 1'
  const REPORT_PART_1_RESULT = { title: REPORT_PART_1_TITLE }
  const REPORT_PART_1_SOURCE_TYPE = 'file'
  const REPORT_PART_1 = {
    id: REPORT_PART_1_ID,
    result: REPORT_PART_1_RESULT,
    sourceType: REPORT_PART_1_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PART_2_ID = 20
  const REPORT_PART_2_TITLE = 'title 2'
  const REPORT_PART_2_RESULT = { title: REPORT_PART_2_TITLE }
  const REPORT_PART_2_SOURCE_TYPE = 'file'
  const REPORT_PART_2 = {
    id: REPORT_PART_2_ID,
    result: REPORT_PART_2_RESULT,
    sourceType: REPORT_PART_2_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PART_3_ID = 30
  const REPORT_PART_3_TITLE = 'title 2'
  const REPORT_PART_3_MEMBER_SINCE = 'REPORT_PART_3_MEMBER_SINCE'
  const REPORT_PART_3_DXUSER = 'REPORT_PART_3_DXUSER'
  const REPORT_PART_3_LINK = 'REPORT_PART_3_LINK'
  const REPORT_PART_3_ROLE = 'REPORT_PART_3_ROLE'
  const REPORT_PART_3_SIDE = 'REPORT_PART_3_SIDE'

  const REPORT_PART_3_RESULT = {
    title: REPORT_PART_3_TITLE,
    memberSince: REPORT_PART_3_MEMBER_SINCE,
    dxuser: REPORT_PART_3_DXUSER,
    link: REPORT_PART_3_LINK,
    role: REPORT_PART_3_ROLE,
    side: REPORT_PART_3_SIDE,
  }
  const REPORT_PART_3_SOURCE_TYPE = 'user'
  const REPORT_PART_3 = {
    id: REPORT_PART_3_ID,
    result: REPORT_PART_3_RESULT,
    sourceType: REPORT_PART_3_SOURCE_TYPE,
  } as unknown as SpaceReportPart

  const REPORT_PARTS = [REPORT_PART_1, REPORT_PART_2, REPORT_PART_3]
  const getPartsStub = stub()

  const OPTIONS_PRETTY_PRINT = false
  const OPTIONS = { prettyPrint: OPTIONS_PRETTY_PRINT }

  const REPORT = {
    id: REPORT_ID,
    reportParts: { getItems: getPartsStub },
    scope: SPACE_SCOPE,
    createdAt: REPORT_CREATED,
    createdBy: CREATED_BY,
    options: OPTIONS,
  } as unknown as SpaceReport<'JSON'>

  let stringifySpy: SinonSpy
  const findOneOrFailStub = stub()

  beforeEach(() => {
    getPartsStub.reset()
    getPartsStub.returns(REPORT_PARTS)

    stringifySpy = spy(JSON, 'stringify')

    findOneOrFailStub.reset()
    findOneOrFailStub.throws()
    findOneOrFailStub.withArgs(Space, SPACE_ID).resolves(SPACE)
  })

  afterEach(() => {
    stringifySpy.restore()
  })

  it('should create a valid JSON', async () => {
    const res = await getInstance().provide(REPORT)

    expect(res).to.not.be.null()
  })

  it('should stringify data correctly', async () => {
    const res = await getInstance().provide(REPORT)

    const resObject = JSON.parse(res)

    expect(resObject).to.deep.equal({
      createdAt: REPORT_CREATED.toJSON(),
      createdBy: CREATED_BY_FULL_NAME,
      space: {
        id: SPACE_ID,
        title: SPACE_NAME,
        description: SPACE_DESCRIPTION,
        entities: {
          files: [REPORT_PART_1_RESULT, REPORT_PART_2_RESULT],
          apps: [],
          jobs: [],
          users: [
            {
              title: REPORT_PART_3_TITLE,
              memberSince: REPORT_PART_3_MEMBER_SINCE,
              dxuser: REPORT_PART_3_DXUSER,
              link: REPORT_PART_3_LINK,
              role: REPORT_PART_3_ROLE,
              side: REPORT_PART_3_SIDE,
            },
          ],
          workflows: [],
          assets: [],
          discussions: [],
        },
      },
    })
  })

  function getInstance() {
    const em = {
      findOneOrFail: findOneOrFailStub,
    } as unknown as SqlEntityManager

    return new SpaceReportResultJsonProvider(em)
  }
})
