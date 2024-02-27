import { Injectable } from '@nestjs/common'
import { SpaceReportPartProvenanceTreeResult } from '@shared/domain/space-report/model/space-report-part-provenance-tree-result'
import { SpaceReportPartTypeForResult } from '@shared/domain/space-report/model/space-report-part-type-for-result'
import { SpaceReportResultPartContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-content.provider'

@Injectable()
export class SpaceReportResultPartProvenanceTreeContentProvider extends SpaceReportResultPartContentProvider<
  SpaceReportPartTypeForResult<SpaceReportPartProvenanceTreeResult>
> {
  protected addContent(
    result: SpaceReportPartProvenanceTreeResult,
    document: Document,
    container: HTMLDivElement,
  ): void {
    const created = document.createElement('p')
    created.textContent = new Date(result.created).toLocaleString()
    container.appendChild(created)

    const diagram = document.createElement('div')
    diagram.classList.add('canvas-wrapper')
    diagram.innerHTML = result.svg
    container.appendChild(diagram)
  }
}
