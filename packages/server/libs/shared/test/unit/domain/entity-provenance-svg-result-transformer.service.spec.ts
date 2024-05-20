import { EntityService } from '@shared/domain/entity/entity.service'
import { EntityProvenance } from '@shared/domain/provenance/model/entity-provenance'
import { EntityProvenanceSvgOptions } from '@shared/domain/provenance/model/entity-provenance-svg-options'
import { EntityProvenanceSvgResultTransformerService } from '@shared/domain/provenance/service/result-transform/entity-provenance-svg-result-transformer.service'
import { ArrayUtils } from '@shared/utils/array.utils'
import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { stub } from 'sinon'

describe('EntityProvenanceSvgResultTransformerService', () => {
  const APP_TITLE = 'app title'
  const APP_URL = 'app url'

  const WORKFLOW_TITLE = 'workflow title'
  const WORKFLOW_URL = 'workflow url'

  const ASSET_TITLE = 'asset title'
  const ASSET_URL = 'asset url'

  const FILE_TITLE = 'file title'
  const FILE_URL = 'file url'

  const JOB_TITLE = 'job title'
  const JOB_URL = 'job url'

  const USER_TITLE = 'user title'
  const USER_URL = 'user url'

  const COMPARISON_TITLE = 'comparison title'
  const COMPARISON_URL = 'comparison url'

  const icons = {
    app: 'app icon',
    workflow: 'workflow icon',
    asset: 'asset icon',
    file: 'file icon',
    job: 'job icon',
    user: 'user icon',
    comparison: 'comparison icon',
  }

  const PROVENANCE: EntityProvenance = {
    data: {
      type: 'app',
      title: APP_TITLE,
      url: APP_URL,
    },
    parents: [
      {
        data: {
          type: 'asset',
          title: ASSET_TITLE,
          url: ASSET_URL,
        },
        parents: [
          {
            data: {
              type: 'file',
              title: FILE_TITLE,
              url: FILE_URL,
            },
            parents: [],
          },
          {
            data: {
              type: 'job',
              title: JOB_TITLE,
              url: JOB_URL,
            },
            parents: [
              {
                data: {
                  type: 'user',
                  title: USER_TITLE,
                  url: USER_URL,
                },
                parents: [
                  {
                    data: {
                      type: 'comparison',
                      title: COMPARISON_TITLE,
                      url: COMPARISON_URL,
                    },
                    parents: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        data: {
          type: 'workflow',
          title: WORKFLOW_TITLE,
          url: WORKFLOW_URL,
        },
        parents: [],
      },
    ],
  }

  const getEntityIconStub = stub()

  beforeEach(() => {
    getEntityIconStub.reset()
    getEntityIconStub.throws()
    Object.entries(icons).forEach(([type, icon]) => {
      getEntityIconStub.withArgs(type).resolves(icon)
    })
  })

  it('should render a svg', async () => {
    const svg = await getResultSvg()

    expect(svg).to.not.be.null()
  })

  it('should contain 7 links', async () => {
    const svg = await getResultSvg()

    expect(svg.getElementsByTagName('a')).to.have.length(7)
  })

  it('should contain style tag', async () => {
    const svg = await getResultSvg()

    expect(svg.getElementsByTagName('style')).to.have.length(1)
  })

  it('should contain style tag when options not defined', async () => {
    const svg = await getResultSvg()

    expect(svg.getElementsByTagName('style')).to.have.length(1)
  })

  it('should contain style tag when omitStyles is false', async () => {
    const svg = await getResultSvg({ omitStyles: false })

    expect(svg.getElementsByTagName('style')).to.have.length(1)
  })

  it('should not contain style tag when omitStyles is true', async () => {
    const svg = await getResultSvg({ omitStyles: true })

    expect(svg.getElementsByTagName('style')).to.have.length(0)
  })

  it('should contain all the correct nodes in correct vertical positions', async () => {
    const svg = await getResultSvg()

    assertNodeRecursive(svg, PROVENANCE)
  })

  function assertNodeRecursive(
    svg: SVGSVGElement,
    node: EntityProvenance,
    parentYCoordinate?: number,
  ) {
    const nodeElements = svg.querySelectorAll(`a[href="${node.data.url}"]`)
    // there is exactly one link with the provided url
    expect(nodeElements).to.have.length(1)

    const nodeElement = nodeElements[0]

    // the link contains a span with icon and the provided title
    expect(nodeElement.textContent).to.eq(icons[node.data.type] + node.data.title)

    const positionedParent = findClosest(nodeElement, 'foreignObject')
    // the link is wrapped in a foreignObject
    expect(positionedParent).not.to.be.null()

    const YCoord = Number(positionedParent.getAttribute('y'))
    // the foreign object has a defined "y" coordinate
    expect(YCoord).not.to.be.NaN()

    if (parentYCoordinate != null) {
      // the y coordinate is below the parent y coordinate
      expect(YCoord).to.be.above(parentYCoordinate)
    }

    const parents = node.parents

    if (ArrayUtils.isEmpty(parents)) {
      return
    }

    parents.forEach((p) => assertNodeRecursive(svg, p, YCoord))
  }

  function findClosest(el: Element, tagName: string): Element {
    let currentElement = el

    while (currentElement?.parentNode != null) {
      if (currentElement.tagName === tagName) {
        return currentElement
      }

      currentElement = currentElement.parentElement
    }

    return null
  }

  async function getResultSvg(options?: EntityProvenanceSvgOptions) {
    return new JSDOM(
      await getInstance().transform(PROVENANCE, options),
    ).window.document.querySelector('svg')!
  }

  function getInstance() {
    const entityService = { getEntityIcon: getEntityIconStub } as unknown as EntityService

    return new EntityProvenanceSvgResultTransformerService(entityService)
  }
})
