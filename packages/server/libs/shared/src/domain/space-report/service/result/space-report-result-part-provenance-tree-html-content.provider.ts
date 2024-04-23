import { Injectable } from '@nestjs/common'
import { SpaceReportPartProvenanceTreeHtmlResult } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result'
import { SpaceReportPartTypeForResult } from '@shared/domain/space-report/model/space-report-part-type-for-result'
import { SpaceReportResultPartHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-html-content.provider'

@Injectable()
export class SpaceReportResultPartProvenanceTreeHtmlContentProvider extends SpaceReportResultPartHtmlContentProvider<
  SpaceReportPartTypeForResult<SpaceReportPartProvenanceTreeHtmlResult>
> {
  protected async addContent(
    result: SpaceReportPartProvenanceTreeHtmlResult,
    document: Document,
    container: HTMLDivElement,
  ): Promise<void> {
    const created = document.createElement('p')
    created.textContent = new Date(result.created).toLocaleString()
    container.appendChild(created)

    const diagram = document.createElement('div')
    diagram.classList.add('canvas-wrapper')
    diagram.innerHTML = result.svg
    container.appendChild(diagram)
  }
}
