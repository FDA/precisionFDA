/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import fs from 'fs/promises'
import path from 'path'
import { JSDOM } from 'jsdom'
import { ArrayUtils } from '../../..'
import type { SpaceReportPart } from '../entity/space-report-part.entity'
import type { SpaceReport } from '../entity/space-report.entity'
import type { SpaceReportPartSourceType } from '../model/space-report-part-source.type'

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

  async generateResult(spaceReport: SpaceReport) {
    const domContainer = new JSDOM(await html)
    const document = domContainer.window.document

    const container = document.createElement('div')
    container.setAttribute('id', 'container')
    document.body.appendChild(container)

    const reportPartsMap = spaceReport.reportParts.getItems()
      .reduce<Record<SpaceReportPartSourceType, SpaceReportPart[]>>((acc, rp) => {
        acc[rp.sourceType].push(rp)
        return acc
      }, { app: [], file: [], job: [], asset: [], workflow: [] })

    const sidebar = await this.getSidebar(reportPartsMap, document)
    container.appendChild(sidebar)

    const resizer = document.createElement('div')
    resizer.setAttribute('id', 'resizer')
    container.appendChild(resizer)
    
    const main = document.createElement('div')
    main.setAttribute('id', 'main')
    
    const report = document.createElement('div')
    report.setAttribute('id', 'report')
    report.appendChild(this.getTitle(spaceReport, document))

    report.appendChild(this.getReportPartTypeHeader('Space Files', this.FILES_HEADER_ID, document))
    const itemListFiles = document.createElement('div')
    itemListFiles.classList.add('item-list')
    report.appendChild(itemListFiles)
    reportPartsMap.file.forEach(rp => itemListFiles.appendChild(this.getReportPartElement(rp, document)))

    report.appendChild(this.getReportPartTypeHeader('Space Apps', this.APPS_HEADER_ID, document))
    const itemListApps = document.createElement('div')
    itemListApps.classList.add('item-list')
    report.appendChild(itemListApps)
    reportPartsMap.app.forEach(rp => itemListApps.appendChild(this.getReportPartElement(rp, document)))

    report.appendChild(this.getReportPartTypeHeader('Space Executions', this.JOBS_HEADER_ID, document))
    const itemListExecutions = document.createElement('div')
    itemListExecutions.classList.add('item-list')
    report.appendChild(itemListExecutions)
    reportPartsMap.job.forEach(rp => itemListExecutions.appendChild(this.getReportPartElement(rp, document)))

    report.appendChild(this.getReportPartTypeHeader('Space Assets', this.ASSETS_HEADER_ID, document))
    const itemListAssets = document.createElement('div')
    itemListAssets.classList.add('item-list')
    report.appendChild(itemListAssets)
    reportPartsMap.asset.forEach(rp => itemListAssets.appendChild(this.getReportPartElement(rp, document)))

    report.appendChild(this.getReportPartTypeHeader('Space Workflows', this.WORKFLOWS_HEADER_ID, document))
    const itemListWorkflows = document.createElement('div')
    itemListWorkflows.classList.add('item-list')
    report.appendChild(itemListWorkflows)
    reportPartsMap.workflow.forEach(rp => itemListWorkflows.appendChild(this.getReportPartElement(rp, document)))

    main.appendChild(report)
    container.appendChild(main)

    return domContainer.serialize()
  }

  private getReportPartTypeHeader(title: string, id: string, document: Document) {
    const header = document.createElement('h2')
    header.innerHTML = title

    const anchor = document.createElement('span')
    anchor.classList.add('anchor')
    anchor.id = id

    header.prepend(anchor)
    return header
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

  private async getSidebar(items: Record<SpaceReportPartSourceType, SpaceReportPart[]>, document: Document) {
    // const logo = document.createElement('div')
    // logo.innerHTML = await logoImage

    const container = document.createElement('div')
    container.setAttribute('id', 'sidebar')
    container.style.width = '300px'
    container.appendChild(this.getToC(items, document))

    return container
  }

  private getToC(items: Record<SpaceReportPartSourceType, SpaceReportPart[]>, document: Document) {
    const container = document.createElement('div')
    container.classList.add('sidebar')

    container.appendChild(this.getResourceItem('Files', this.FILES_HEADER_ID, items.file, document))
    container.appendChild(this.getResourceItem('Apps', this.APPS_HEADER_ID, items.app, document))
    container.appendChild(this.getResourceItem('Executions', this.JOBS_HEADER_ID, items.job, document))
    container.appendChild(this.getResourceItem('Assets', this.ASSETS_HEADER_ID, items.asset, document))
    container.appendChild(this.getResourceItem('Workflows', this.WORKFLOWS_HEADER_ID, items.workflow, document))

    return container
  }

  private getResourceItem(title: string, anchor: string, reportParts: SpaceReportPart[], document: Document) {
    const section = document.createElement('div')
    section.classList.add('navbar-item')

    const collapse = document.createElement('span')
    collapse.classList.add('collapse-icon')
    collapse.innerHTML = '<svg id="triangle" viewBox="0 0 100 100"><polygon fill="currentColor" points="50 15, 100 100, 0 100"/</svg>'
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

    const subItems = reportParts.map(rp => {
      const sublink = document.createElement('a')
      sublink.href = `#${this.REPORT_PART_ID_PREFIX}${rp.id}`
      sublink.innerHTML = rp.result.title

      return sublink
    })

    subItems.forEach(sni => subnav.appendChild(sni))
    section.appendChild(subnav)

    return section
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
