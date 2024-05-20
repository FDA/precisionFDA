import { SpaceReportPart } from '@shared/domain/space-report/entity/space-report-part.entity'
import { SpaceReportPartResult } from '@shared/domain/space-report/model/space-report-part-result'
import { SpaceReportPartSourceType } from '@shared/domain/space-report/model/space-report-part-source.type'
import { JSDOM } from 'jsdom'

export abstract class SpaceReportResultPartHtmlContentProvider<
  T extends SpaceReportPartSourceType,
> {
  protected abstract addContent(
    result: SpaceReportPartResult<T, 'HTML'>,
    document: Document,
    container: HTMLDivElement,
  ): Promise<void>

  async provide(reportPart: SpaceReportPart<T, 'HTML'>, titleId: string): Promise<HTMLDivElement> {
    const domContainer = new JSDOM()
    const document = domContainer.window.document
    const container = document.createElement('div')
    container.classList.add('item')

    const title = document.createElement('h3')
    title.textContent = reportPart.result.title
    title.id = titleId
    container.appendChild(title)

    await this.addContent(reportPart.result, document, container)

    return container
  }
}
