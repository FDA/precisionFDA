import { SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable } from '@nestjs/common'
import { spaceMembershipSideToNameMap } from '@shared/domain/space-membership/space-membership-side-to-name.map'
import { SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportFormatToResultOptionsMap } from '@shared/domain/space-report/model/space-report-format-to-result-options.map'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP } from '@shared/domain/space-report/providers/source-type-to-part-content-provider.provider'
import { SpaceReportResultPartHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-html-content.provider'
import { SpaceReportResultProvider } from '@shared/domain/space-report/service/result/space-report-result.provider'
import { Space } from '@shared/domain/space/space.entity'
import { ArrayUtils } from '@shared/utils/array.utils'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import fs from 'fs/promises'
import DOMPurify from 'isomorphic-dompurify'
import { JSDOM } from 'jsdom'
import path from 'path'

// TODO(PFDA-4835) - use import after introducing bundler with nestjs
const assetsPath = path.join(
  __dirname,
  '../../../../../../../../../../libs/shared/src/domain/space-report/assets',
)
const triangleIcon = fs.readFile(path.join(assetsPath, 'triangle-icon.svg'), 'utf8').catch(() => '')
const logoImage = fs.readFile(path.join(assetsPath, 'logo.svg'), 'utf8').catch(() => '')
const html = fs.readFile(path.join(assetsPath, 'result-wrapper.html'), 'utf8').catch(() => '')
const script = fs.readFile(path.join(assetsPath, 'wrapper-script.js'), 'utf8').catch(() => '')

@Injectable()
export class SpaceReportResultHtmlProvider extends SpaceReportResultProvider<'HTML'> {
  private readonly USERS_HEADER_ID = 'header-users'
  private readonly FILES_HEADER_ID = 'header-files'
  private readonly APPS_HEADER_ID = 'header-apps'
  private readonly JOBS_HEADER_ID = 'header-jobs'
  private readonly ASSETS_HEADER_ID = 'header-assets'
  private readonly WORKFLOWS_HEADER_ID = 'header-workflows'
  private readonly DISCUSSIONS_HEADER_ID = 'header-discussions'
  private readonly REPORT_PART_ID_PREFIX = 'report-part-'

  constructor(
    @Inject(SOURCE_TYPE_TO_PART_CONTENT_PROVIDER_MAP)
    private readonly sourceTypeToPartContentProviderMap: {
      [T in SpaceReportPartSourceType]: SpaceReportResultPartHtmlContentProvider<T>
    },
    private readonly em: SqlEntityManager,
  ) {
    super()
  }

  async provide(
    spaceReport: SpaceReport<'HTML'>,
    { styles }: SpaceReportFormatToResultOptionsMap['HTML'],
  ) {
    const domContainer = new JSDOM(await html)
    const document = domContainer.window.document

    const head = document.getElementsByTagName('head')[0]

    if (styles) {
      const style = document.createElement('style')
      style.innerHTML = styles
      head.appendChild(style)
    }

    const container = document.createElement('div')
    container.id = 'container'
    document.body.appendChild(container)

    const reportPartsMap = this.getReportPartsMap(spaceReport)

    const sidebar = await this.getSidebar(reportPartsMap, document)
    container.appendChild(sidebar)

    const resizer = document.createElement('div')
    resizer.id = 'resizer'
    container.appendChild(resizer)

    const main = document.createElement('main')
    main.id = 'main'
    container.appendChild(main)

    const report = document.createElement('div')
    report.id = 'report'
    report.appendChild(await this.getHeader(spaceReport, document))
    report.appendChild(await this.getReportSegmentForMembers(reportPartsMap.user, document))
    report.appendChild(
      await this.getReportSegment('Files', this.FILES_HEADER_ID, reportPartsMap.file, document),
    )
    report.appendChild(
      await this.getReportSegment('Apps', this.APPS_HEADER_ID, reportPartsMap.app, document),
    )
    report.appendChild(
      await this.getReportSegment('Executions', this.JOBS_HEADER_ID, reportPartsMap.job, document),
    )
    report.appendChild(
      await this.getReportSegment('Assets', this.ASSETS_HEADER_ID, reportPartsMap.asset, document),
    )
    report.appendChild(
      await this.getReportSegment(
        'Workflows',
        this.WORKFLOWS_HEADER_ID,
        reportPartsMap.workflow,
        document,
      ),
    )
    report.appendChild(
      await this.getReportSegment(
        'Discussions',
        this.DISCUSSIONS_HEADER_ID,
        reportPartsMap.discussion,
        document,
      ),
    )
    main.appendChild(report)

    document.body.innerHTML = DOMPurify.sanitize(document.body.innerHTML, {
      ADD_TAGS: ['foreignObject'],
      ADD_ATTR: ['target'],
    })

    const scriptElement = document.createElement('script')
    scriptElement.innerHTML = await script
    document.body.insertBefore(scriptElement, document.body.firstChild)

    return domContainer.serialize()
  }

  private async getReportSegment(
    title: string,
    id: string,
    reportParts: SpaceReportPart<SpaceReportPartSourceType, 'HTML'>[],
    document: Document,
  ) {
    const container = document.createElement('div')
    container.appendChild(this.getReportSegmentHeader(title, id, document))

    if (ArrayUtils.isEmpty(reportParts)) {
      const emptyText = document.createElement('p')
      emptyText.classList.add('empty-text')
      emptyText.textContent = `There are no ${title.toLowerCase()} in this space.`
      container.appendChild(emptyText)

      return container
    }

    container.appendChild(await this.getReportPartItemList(reportParts, document))

    return container
  }

  private getReportSegmentHeader(title: string, id: string, document: Document) {
    const container = document.createElement('div')

    const spacer = document.createElement('div')
    spacer.classList.add('spacer')
    container.appendChild(spacer)

    const sectionHeading = document.createElement('div')
    sectionHeading.classList.add('section-heading')
    container.appendChild(sectionHeading)

    const sectionTitle = document.createElement('h2')
    sectionTitle.textContent = title
    sectionTitle.id = id
    sectionHeading.appendChild(sectionTitle)

    return container
  }

  private async getReportPartItemList(
    reportParts: SpaceReportPart<SpaceReportPartSourceType, 'HTML'>[],
    document: Document,
  ) {
    const container = document.createElement('div')
    container.classList.add('item-list')

    for (const reportPart of reportParts) {
      container.appendChild(await this.getReportPartContent(reportPart, document))
    }

    return container
  }

  private async getReportPartContent<T extends SpaceReportPartSourceType>(
    reportPart: SpaceReportPart<T, 'HTML'>,
    document: Document,
  ) {
    const wrapper = document.createElement('div')
    wrapper.classList.add('item-wrapper')

    const titleId = `${this.REPORT_PART_ID_PREFIX}${reportPart.id}`
    const content = await this.sourceTypeToPartContentProviderMap[reportPart.sourceType].provide(
      reportPart,
      titleId,
    )

    wrapper.appendChild(content)

    return wrapper
  }

  private async getReportSegmentForMembers(
    reportParts: SpaceReportPart<'user', 'HTML'>[],
    document: Document,
  ) {
    const title = 'Members'
    const id = this.USERS_HEADER_ID

    const sideToResultsMap = reportParts.reduce((acc, rp) => {
      const side = rp.result.side

      if (!acc.has(side)) {
        acc.set(side, [])
      }

      acc.get(side).push(rp)

      return acc
    }, new Map<SPACE_MEMBERSHIP_SIDE, SpaceReportPart<'user', 'HTML'>[]>())

    if (sideToResultsMap.size < 2) {
      return this.getReportSegment(title, id, reportParts, document)
    }

    const container = document.createElement('div')
    container.appendChild(this.getReportSegmentHeader(title, id, document))

    for (const [side, reportParts] of sideToResultsMap.entries()) {
      const sideContainer = document.createElement('div')

      const sideHeader = document.createElement('h3')
      sideHeader.textContent = `${spaceMembershipSideToNameMap[side]} side`
      sideContainer.appendChild(sideHeader)

      sideContainer.appendChild(await this.getReportPartItemList(reportParts, document))
      container.appendChild(sideContainer)
    }

    return container
  }

  private async getSidebar(
    items: Record<SpaceReportPartSourceType, SpaceReportPart[]>,
    document: Document,
  ) {
    const container = document.createElement('aside')
    container.id = 'sidebar'
    container.style.width = '250px'

    const sidenav = document.createElement('div')
    sidenav.classList.add('sidenav')
    sidenav.appendChild(
      await this.getResourceItem('Members', this.USERS_HEADER_ID, items.user, document),
    )
    sidenav.appendChild(
      await this.getResourceItem('Files', this.FILES_HEADER_ID, items.file, document),
    )
    sidenav.appendChild(
      await this.getResourceItem('Apps', this.APPS_HEADER_ID, items.app, document),
    )
    sidenav.appendChild(
      await this.getResourceItem('Executions', this.JOBS_HEADER_ID, items.job, document),
    )
    sidenav.appendChild(
      await this.getResourceItem('Assets', this.ASSETS_HEADER_ID, items.asset, document),
    )
    sidenav.appendChild(
      await this.getResourceItem('Workflows', this.WORKFLOWS_HEADER_ID, items.workflow, document),
    )
    sidenav.appendChild(
      await this.getResourceItem(
        'Discussions',
        this.DISCUSSIONS_HEADER_ID,
        items.discussion,
        document,
      ),
    )
    container.appendChild(sidenav)

    return container
  }

  private async getResourceItem(
    title: string,
    anchor: string,
    reportParts: SpaceReportPart[],
    document: Document,
  ) {
    const section = document.createElement('div')
    section.classList.add('navbar-item')

    const collapse = document.createElement('span')
    const collapseClass = ArrayUtils.isEmpty(reportParts) ? 'empty-icon' : 'collapse-icon'
    collapse.classList.add(collapseClass)
    collapse.innerHTML = await triangleIcon
    section.appendChild(collapse)

    const link = document.createElement('a')
    link.classList.add('section-name')
    link.href = `#${anchor}`
    link.textContent = title
    section.appendChild(link)

    if (ArrayUtils.isEmpty(reportParts)) {
      return section
    }

    const subnav = document.createElement('div')
    subnav.classList.add('subnav')
    reportParts.forEach((rp) => subnav.appendChild(this.getResourceLink(rp, document)))
    section.appendChild(subnav)

    return section
  }

  private getResourceLink(reportPart: SpaceReportPart, document: Document) {
    const container = document.createElement('a')
    container.href = `#${this.REPORT_PART_ID_PREFIX}${reportPart.id}`
    container.textContent = reportPart.result.title

    return container
  }

  private async getHeader(report: SpaceReport<'HTML'>, document: Document) {
    const container = document.createElement('div')
    container.classList.add('header')

    const title = document.createElement('div')
    title.classList.add('title')
    container.appendChild(title)

    const logo = document.createElement('div')
    logo.classList.add('logo')
    logo.innerHTML = await logoImage
    title.appendChild(logo)

    const name = document.createElement('span')
    name.textContent = 'Space Report'
    name.classList.add('report-title')
    logo.appendChild(name)

    const reportType = document.createElement('span')
    reportType.textContent = 'Space Report and Provenance Tracking'
    reportType.classList.add('report-type')
    title.appendChild(reportType)

    const spacer = document.createElement('div')
    spacer.classList.add('spacer')
    container.appendChild(spacer)

    const description = document.createElement('p')
    description.textContent = `
      The Space Report provides a snapshot of the membership, Files, Apps, Executions, Assets,
      Workflows, and Discussions within a Space. Provenance tracking provides comprehensive
      documentation of the lineage and history of Files, Apps, Executions, Assets, and Workflows
      within the precisionFDA system. Through this report, users can gain insights into the origin,
      movement, and life-cycle of each item, ensuring transparency, traceability, and accountability.
      The report also documents all members with access to the Space at the time of report generation,
      and captures all Discussions within the Space.
    `
    description.classList.add('report-description')
    container.appendChild(description)

    const space = EntityScopeUtils.isSpaceScope(report.scope)
      ? await this.em.findOneOrFail(Space, EntityScopeUtils.getSpaceIdFromScope(report.scope))
      : null

    const infoRow1 = document.createElement('div')
    infoRow1.classList.add('info-area')
    infoRow1.appendChild(
      this.getHeaderInfoPart(
        'Space Name',
        this.getTitleText(report.createdBy.getEntity(), space),
        document,
      ),
    )
    infoRow1.appendChild(
      this.getHeaderInfoPart(
        'Report Generated On',
        new Date(report.createdAt).toLocaleString(),
        document,
        ['align-right'],
      ),
    )
    container.appendChild(infoRow1)

    if (space) {
      const infoRow2 = document.createElement('div')
      infoRow2.classList.add('info-area')
      infoRow2.appendChild(this.getHeaderInfoPart('Space Description', space.description, document))
      container.appendChild(infoRow2)
    }

    return container
  }

  private getHeaderInfoPart(
    titleText: string,
    descriptionText: string,
    document: Document,
    classes: string[] = [],
  ) {
    const container = document.createElement('div')
    container.classList.add('group', ...classes)

    const title = document.createElement('div')
    title.classList.add('key')
    title.textContent = titleText
    container.appendChild(title)

    const description = document.createElement('div')
    description.classList.add('value')
    description.textContent = descriptionText
    container.appendChild(description)

    return container
  }
}
