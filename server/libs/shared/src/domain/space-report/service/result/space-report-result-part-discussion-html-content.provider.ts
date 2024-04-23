import { Injectable } from '@nestjs/common'
import { EntityService } from '@shared/domain/entity/entity.service'
import {
  SpaceReportPartDiscussionResult,
  SpaceReportPartDiscussionResultAnswer,
  SpaceReportPartDiscussionResultAttachment,
  SpaceReportPartDiscussionResultComment,
  SpaceReportPartDiscussionResultCommentCreatedBy,
} from '@shared/domain/space-report/model/space-report-part-discussion-result'
import { SpaceReportResultPartHtmlContentProvider } from '@shared/domain/space-report/service/result/space-report-result-part-html-content.provider'
import { ArrayUtils } from '@shared/utils/array.utils'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

@Injectable()
export class SpaceReportResultPartDiscussionHtmlContentProvider extends SpaceReportResultPartHtmlContentProvider<'discussion'> {
  constructor(private readonly entityService: EntityService) {
    super()
  }

  protected async addContent(
    result: SpaceReportPartDiscussionResult,
    document: Document,
    container: HTMLDivElement,
  ): Promise<void> {
    container.appendChild(
      await this.getItemContainer(result, document, 'started the discussion on'),
    )

    for (const answer of result.answers) {
      container.appendChild(await this.getAnswer(answer, document))
    }

    for (const comment of result.comments) {
      container.appendChild(await this.getComment(comment, document))
    }
  }

  private async getAnswer(answer: SpaceReportPartDiscussionResultAnswer, document: Document) {
    const container = await this.getItemContainer(answer, document, 'answered on')
    container.classList.add('answer')

    for (const comment of answer.comments) {
      container.appendChild(await this.getComment(comment, document))
    }

    return container
  }

  private async getComment(comment: SpaceReportPartDiscussionResultComment, document: Document) {
    const container = await this.getItemContainer(comment, document, 'commented on')
    container.classList.add('comment')

    return container
  }

  private async getItemContainer(
    data: {
      content: string
      createdBy: SpaceReportPartDiscussionResultCommentCreatedBy
      createdAt: Date
      attachments?: SpaceReportPartDiscussionResultAttachment[]
    },
    document: Document,
    headerSeparator: string,
  ) {
    const container = document.createElement('div')
    container.classList.add('discussion-item')

    const header = document.createElement('p')
    header.classList.add('discussion-header')

    const createdBy = document.createElement('span')
    createdBy.textContent = data.createdBy.fullName
    header.appendChild(createdBy)

    const createdSeparator = document.createElement('span')
    createdSeparator.textContent = ` ${headerSeparator} `
    header.appendChild(createdSeparator)

    const createdAt = document.createElement('span')
    createdAt.textContent = new Date(data.createdAt).toLocaleString()
    header.appendChild(createdAt)

    container.appendChild(header)

    const contentWrapper = document.createElement('p')
    contentWrapper.classList.add('content')
    contentWrapper.innerHTML = DOMPurify.sanitize(await marked.parse(data.content))

    container.appendChild(contentWrapper)

    if (ArrayUtils.isEmpty(data.attachments)) {
      return container
    }

    const attachments = document.createElement('div')
    attachments.appendChild(document.createElement('br'))

    const attachmentsHeader = document.createElement('p')
    const attachmentsHeaderContent = document.createElement('strong')
    attachmentsHeaderContent.textContent = 'Attachments'
    attachmentsHeader.appendChild(attachmentsHeaderContent)
    attachments.appendChild(attachmentsHeader)

    for (const attachment of data.attachments) {
      const attachmentContainer = document.createElement('div')
      attachmentContainer.classList.add('attachment')

      const link = document.createElement('a')
      link.href = attachment.link
      link.setAttribute('target', '_blank')
      link.innerHTML = await this.entityService.getEntityIcon(attachment.type)

      const text = document.createElement('span')
      text.textContent = attachment.name
      link.appendChild(text)

      attachmentContainer.appendChild(link)

      attachments.appendChild(attachmentContainer)
    }

    container.appendChild(attachments)

    return container
  }
}
