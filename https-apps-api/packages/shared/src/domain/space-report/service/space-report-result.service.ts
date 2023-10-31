import fs from 'fs/promises'
import { JSDOM } from 'jsdom'
import path from 'path'
import { ArrayUtils } from '../../..'
import { SpaceReportPart } from '../entity/space-report-part.entity'
import { SpaceReport } from '../entity/space-report.entity'
import { SpaceReportPartSourceType } from '../model/space-report-part-source.type'

// TODO - use import after introducing bundler with nestjs
const assetsPath = path.join(__dirname, '../../../../src/domain/space-report/assets')
const logoImage = fs.readFile(path.join(assetsPath, 'logo.svg'), 'utf8')
const html = fs.readFile(path.join(assetsPath, 'result-wrapper.html'), 'utf8')

export class SpaceReportResultService {
  private readonly FILES_HEADER_ID = 'header-files'
  private readonly APPS_HEADER_ID = 'header-apps'
  private readonly JOBS_HEADER_ID = 'header-jobs'
  private readonly ASSETS_HEADER_ID = 'header-assets'
  private readonly WORKFLOWS_HEADER_ID = 'header-workflows'
  private readonly REPORT_PART_ID_PREFIX = 'report-part-'

  async generateResult(report: SpaceReport) {
    const domContainer = new JSDOM(await html)
    const document = domContainer.window.document

    const reportPartsMap = report.reportParts.getItems()
      .reduce<Record<SpaceReportPartSourceType, SpaceReportPart[]>>((acc, rp) => {
        acc[rp.sourceType].push(rp)
        return acc
      }, { app: [], file: [], job: [], asset: [], workflow: [] })

    const header = await this.getHeader(reportPartsMap, document)
    document.body.appendChild(header)

    const container = document.createElement('div')
    container.classList.add('container')
    container.appendChild(this.getTitle(report, document))

    container.appendChild(this.getReportSegment('Files', this.FILES_HEADER_ID, reportPartsMap.file, document))
    container.appendChild(this.getReportSegment('Apps', this.APPS_HEADER_ID, reportPartsMap.app, document))
    container.appendChild(this.getReportSegment('Executions', this.JOBS_HEADER_ID, reportPartsMap.job, document))
    container.appendChild(this.getReportSegment('Assets', this.ASSETS_HEADER_ID, reportPartsMap.asset, document))
    container.appendChild(this.getReportSegment('Workflows', this.WORKFLOWS_HEADER_ID, reportPartsMap.workflow, document))

    document.body.appendChild(container)

    return domContainer.serialize()
  }

  private getReportSegment(title: string, id: string, parts: SpaceReportPart[], document: Document) {
    const container = document.createElement('div')

    const header = document.createElement('h2')
    header.innerHTML = title

    const anchor = document.createElement('span')
    anchor.classList.add('anchor')
    anchor.id = id

    header.prepend(anchor)

    container.appendChild(header)

    if (ArrayUtils.isEmpty(parts)) {
      const emptyText = document.createElement('p')
      emptyText.innerHTML = `There are no ${title.toLowerCase()} in the space.`
      container.appendChild(emptyText)

      return container
    }

    parts.forEach(rp => container.appendChild(this.getReportPartElement(rp, document)))

    return container
  }

  private getReportPartElement(rp: SpaceReportPart, document: Document) {
    const title = document.createElement('h3')
    title.innerHTML = rp.result.title

    const anchor = document.createElement('span')
    anchor.classList.add('anchor')
    anchor.id = `${this.REPORT_PART_ID_PREFIX}${rp.id}`
    title.prepend(anchor)

    const created = document.createElement('p')
    created.innerHTML = new Date(rp.result.created).toLocaleString()

    const diagram = document.createElement('div')
    diagram.classList.add('canvas-wrapper')
    diagram.innerHTML = rp.result.svg

    const container = document.createElement('div')
    container.classList.add('item')
    container.appendChild(title)
    container.appendChild(created)
    container.appendChild(diagram)

    return container
  }

  private async getHeader(items: Record<SpaceReportPartSourceType, SpaceReportPart[]>, document: Document) {
    const logo = document.createElement('div')
    logo.innerHTML = await logoImage

    const container = document.createElement('div')
    container.classList.add('header')
    container.appendChild(logo)
    container.appendChild(this.getNavbar(items, document))

    return container
  }

  private getNavbar(items: Record<SpaceReportPartSourceType, SpaceReportPart[]>, document: Document) {
    const container = document.createElement('div')
    container.classList.add('navbar')

    container.appendChild(this.getNavbarItem('Files', this.FILES_HEADER_ID, items.file, document))
    container.appendChild(this.getNavbarItem('Apps', this.APPS_HEADER_ID, items.app, document))
    container.appendChild(this.getNavbarItem('Executions', this.JOBS_HEADER_ID, items.job, document))
    container.appendChild(this.getNavbarItem('Assets', this.ASSETS_HEADER_ID, items.asset, document))
    container.appendChild(this.getNavbarItem('Workflows', this.WORKFLOWS_HEADER_ID, items.workflow, document))

    return container
  }

  private getNavbarItem(title: string, anchor: string, reportParts: SpaceReportPart[], document: Document) {
    const container = document.createElement('div')
    container.classList.add('navbar-item')

    const link = document.createElement('a')
    link.href = `#${anchor}`
    link.innerHTML = title
    container.appendChild(link)

    if (ArrayUtils.isEmpty(reportParts)) {
      return container
    }

    const subnav = document.createElement('div')
    subnav.classList.add('subnav')

    const subnavItems = reportParts.map(rp => {
      const sublink = document.createElement('a')
      sublink.href = `#${this.REPORT_PART_ID_PREFIX}${rp.id}`
      sublink.innerHTML = rp.result.title

      return sublink
    })

    subnavItems.forEach(sni => subnav.appendChild(sni))

    const subnavContainer = document.createElement('div')
    subnavContainer.classList.add('subnav-container')
    subnavContainer.appendChild(subnav)
    container.appendChild(subnavContainer)

    return container
  }

  private getTitle(report: SpaceReport, document: Document) {
    const title = document.createElement('div')
    title.classList.add('title')

    const spaceName = document.createElement('h1')
    spaceName.innerHTML = report.space.name
    title.appendChild(spaceName)

    const spaceDescription = document.createElement('p')
    const spaceDescriptionText = document.createElement('b')
    spaceDescriptionText.innerHTML = report.space.description
    spaceDescription.appendChild(spaceDescriptionText)
    title.appendChild(spaceDescription)

    const reportCreated = document.createElement('p')
    reportCreated.innerHTML = new Date(report.createdAt).toLocaleString()
    title.appendChild(reportCreated)

    return title
  }
}
