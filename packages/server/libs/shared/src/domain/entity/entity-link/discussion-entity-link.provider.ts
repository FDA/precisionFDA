import { Injectable } from '@nestjs/common'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'

@Injectable()
export class DiscussionEntityLinkProvider extends EntityLinkProvider<'discussion'> {
  protected async getRelativeLink(discussion: Discussion) {
    const note = await discussion.note.load()

    return `/spaces/${note.getSpaceId()}/discussions/${discussion.id}` as const
  }
}
