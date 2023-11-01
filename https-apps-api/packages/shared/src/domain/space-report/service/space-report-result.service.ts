import fs from 'fs/promises'
import path from 'path'
import { JSDOM } from 'jsdom'
import { ArrayUtils } from '../../..'
import { SpaceReportPart } from '../entity/space-report-part.entity'
import { SpaceReport } from '../entity/space-report.entity'
import { SpaceReportPartSourceType } from '../model/space-report-part-source.type'

// TODO - use import after introducing bundler with nestjs
const assetsPath = path.join(__dirname, '../../../../src/domain/space-report/assets')
const triangleIcon = fs.readFile(path.join(assetsPath, 'triangle-icon.svg'), 'utf8')
const logoImage = fs.readFile(path.join(assetsPath, 'logo.svg'), 'utf8')
const html = fs.readFile(path.join(assetsPath, 'result-wrapper.html'), 'utf8')

export class SpaceReportResultService {
  private readonly FILES_HEADER_ID = 'header-files'
  private readonly APPS_HEADER_ID = 'header-apps'
  private readonly JOBS_HEADER_ID = 'header-jobs'
  private readonly ASSETS_HEADER_ID = 'header-assets'
  private readonly WORKFLOWS_HEADER_ID = 'header-workflows'
  private readonly REPORT_PART_ID_PREFIX = 'report-part-'

  async generateResult(spaceReport: SpaceReport, styles?: string) {
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

    const reportPartsMap = spaceReport.reportParts.getItems()
      .reduce<Record<SpaceReportPartSourceType, SpaceReportPart[]>>((acc, rp) => {
        acc[rp.sourceType].push(rp)
        return acc
      }, { app: [], file: [], job: [], asset: [], workflow: [] })

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
    report.appendChild(this.getReportSegment('Files', this.FILES_HEADER_ID, reportPartsMap.file, document))
    report.appendChild(this.getReportSegment('Apps', this.APPS_HEADER_ID, reportPartsMap.app, document))
    report.appendChild(this.getReportSegment('Executions', this.JOBS_HEADER_ID, reportPartsMap.job, document))
    report.appendChild(this.getReportSegment('Assets', this.ASSETS_HEADER_ID, reportPartsMap.asset, document))
    report.appendChild(this.getReportSegment('Workflows', this.WORKFLOWS_HEADER_ID, reportPartsMap.workflow, document))
    main.appendChild(report)

    return domContainer.serialize()
  }

  private getReportSegment(title: string, id: string, parts: SpaceReportPart[], document: Document) {
    const container = document.createElement('div')

    const spacer = document.createElement('div')
    spacer.classList.add('spacer')
    container.appendChild(spacer)

    const sectionHeading = document.createElement('div')
    sectionHeading.classList.add('section-heading')
    container.appendChild(sectionHeading)

    const sectionTitle = document.createElement('h2')
    sectionTitle.innerHTML = title
    sectionTitle.id = id
    sectionHeading.appendChild(sectionTitle)

    if (ArrayUtils.isEmpty(parts)) {
      const emptyText = document.createElement('p')
      emptyText.classList.add('empty-text')
      emptyText.innerHTML = `There are no ${title.toLowerCase()} in this space.`
      container.appendChild(emptyText)

      return container
    }

    const itemList = document.createElement('div')
    itemList.classList.add('item-list')
    parts.forEach(rp => itemList.appendChild(this.getReportPartContent(rp, document)))
    container.appendChild(itemList)

    return container
  }

  private getReportPartContent(rp: SpaceReportPart, document: Document) {
    const wrapper = document.createElement('div')
    wrapper.classList.add('item-wrapper')

    const container = document.createElement('div')
    container.classList.add('item')
    wrapper.appendChild(container)

    const title = document.createElement('h3')
    title.innerHTML = rp.result.title
    title.id = `${this.REPORT_PART_ID_PREFIX}${rp.id}`
    container.appendChild(title)

    const created = document.createElement('p')
    created.innerHTML = new Date(rp.result.created).toLocaleString()
    container.appendChild(created)

    const diagram = document.createElement('div')
    diagram.classList.add('canvas-wrapper')
    diagram.innerHTML = rp.result.svg
    container.appendChild(diagram)

    return wrapper
  }

  private async getSidebar(items: Record<SpaceReportPartSourceType, SpaceReportPart[]>, document: Document) {
    const container = document.createElement('aside')
    container.id = 'sidebar'
    container.style.width = '250px'

    const sidenav = document.createElement('div')
    sidenav.classList.add('sidenav')
    sidenav.appendChild(await this.getResourceItem('Files', this.FILES_HEADER_ID, items.file, document))
    sidenav.appendChild(await this.getResourceItem('Apps', this.APPS_HEADER_ID, items.app, document))
    sidenav.appendChild(await this.getResourceItem('Executions', this.JOBS_HEADER_ID, items.job, document))
    sidenav.appendChild(await this.getResourceItem('Assets', this.ASSETS_HEADER_ID, items.asset, document))
    sidenav.appendChild(await this.getResourceItem('Workflows', this.WORKFLOWS_HEADER_ID, items.workflow, document))
    container.appendChild(sidenav)

    return container
  }

  private async getResourceItem(title: string, anchor: string, reportParts: SpaceReportPart[], document: Document) {
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
    link.innerHTML = title
    section.appendChild(link)

    if (ArrayUtils.isEmpty(reportParts)) {
      return section
    }

    const subnav = document.createElement('div')
    subnav.classList.add('subnav')
    reportParts.forEach(rp => subnav.appendChild(this.getResourceLink(rp, document)))
    section.appendChild(subnav)

    return section
  }

  private getResourceLink(rp: SpaceReportPart, document: Document) {
    const container = document.createElement('a')
    container.href = `#${this.REPORT_PART_ID_PREFIX}${rp.id}`
    container.innerHTML = rp.result.title

    return container
  }

  private async getHeader(report: SpaceReport, document: Document) {
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
    name.innerHTML = 'Space Report'
    name.classList.add('report-title')
    logo.appendChild(name)

    const reportType = document.createElement('span')
    reportType.innerHTML = 'Provenance Tracking'
    reportType.classList.add('report-type')
    title.appendChild(reportType)

    const spacer = document.createElement('div')
    spacer.classList.add('spacer')
    container.appendChild(spacer)

    const description = document.createElement('p')
    description.innerHTML = `
      The Provenance Tracking Report provides a comprehensive documentation
      of the lineage and history of Files, Apps, Executions, Assets, and
      Workflows within the precisionFDA system. Through this report, users
      can gain insights into the origin, movement, and life-cycle of each
      item, ensuring transparency, traceability, and accountability.
    `
    description.classList.add('report-description')
    container.appendChild(description)

    const infoRow1 = document.createElement('div')
    infoRow1.classList.add('info-area')
    infoRow1.appendChild(this.getHeaderInfoPart('Space Name', report.space.name, document))
    infoRow1.appendChild(this.getHeaderInfoPart('Report Generated On', new Date(report.createdAt).toLocaleString(), document, ['align-right']))
    container.appendChild(infoRow1)

    const infoRow2 = document.createElement('div')
    infoRow2.classList.add('info-area')
    infoRow2.appendChild(this.getHeaderInfoPart('Space Description', report.space.description, document))
    container.appendChild(infoRow2)

    return container
  }

  private getHeaderInfoPart(titleText: string, descriptionText: string, document: Document, classes: string[] = []) {
    const container = document.createElement('div')
    container.classList.add('group', ...classes)

    const title = document.createElement('div')
    title.classList.add('key')
    title.innerHTML = titleText
    container.appendChild(title)

    const description = document.createElement('div')
    description.classList.add('value')
    description.innerHTML = descriptionText
    container.appendChild(description)

    return container
  }
}
