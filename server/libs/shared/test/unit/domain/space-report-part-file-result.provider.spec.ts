import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { SpaceReportPartFileResultProvider } from '@shared/facade/space-report/service/space-report-part-file-result-provider.service'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceReportPartFileResultProvider', () => {
  const NAME = 'name'
  const CREATED = 'created'

  const FILE = {
    name: NAME,
    createdAt: CREATED,
  } as unknown as UserFile

  const PROVENANCE_SVG = 'provenance svg'
  const PROVENANCE_RAW = 'provenance raw'

  const getEntityProvenanceStub = stub()

  beforeEach(() => {
    getEntityProvenanceStub.reset()
    getEntityProvenanceStub.throws()
    getEntityProvenanceStub
      .withArgs(
        {
          type: 'file',
          entity: FILE,
        },
        'svg',
        { omitStyles: true },
      )
      .resolves(PROVENANCE_SVG)
      .withArgs(
        {
          type: 'file',
          entity: FILE,
        },
        'raw',
      )
      .resolves(PROVENANCE_RAW)
  })

  it('should provide correct HTML result', async () => {
    const res = await getInstance().getResult(FILE, null, 'HTML')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, svg: PROVENANCE_SVG })
  })

  it('should provide correct JSON result', async () => {
    const res = await getInstance().getResult(FILE, null, 'JSON')

    expect(res).to.deep.equal({ title: NAME, created: CREATED, provenance: PROVENANCE_RAW })
  })

  function getInstance() {
    const entityProvenanceService = {
      getEntityProvenance: getEntityProvenanceStub,
    } as unknown as EntityProvenanceService

    return new SpaceReportPartFileResultProvider(entityProvenanceService)
  }
})
