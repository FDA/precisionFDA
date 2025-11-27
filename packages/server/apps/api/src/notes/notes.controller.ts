import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { DiscussionAttachmentDTO } from '@shared/domain/attachment/dto/discussion-attachment.dto'
import { NoteQueryParamsDTO } from '@shared/domain/note/dto/note-query-params.dto'
import { AttachmentRetrieveFacade } from '@shared/facade/discussion/attachment-retrieve.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/notes')
export class NotesController {
  constructor(private readonly attachmentRetrieveFacade: AttachmentRetrieveFacade) {}

  @Post('/attachments')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Fetch attachments for given note IDs - Object with note IDs as keys and attachment arrays as values',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { $ref: '#/components/schemas/DiscussionAttachmentDTO' },
      },
      example: {
        1: [
          {
            id: 1,
            link: 'link-to-file',
            name: 'file.jpg',
            type: 'UserFile',
            uid: 'file-uid-1',
          },
        ],
        2: [
          {
            id: 2,
            link: 'link-to-app',
            name: 'app-1',
            type: 'App',
            uid: 'app-uid-1',
          },
        ],
      },
    },
  })
  async fetchNotesAttachments(
    @Body() body: NoteQueryParamsDTO,
  ): Promise<Record<number, DiscussionAttachmentDTO[]>> {
    return await this.attachmentRetrieveFacade.getAttachmentsByNoteIds(body.ids)
  }
}
