import { Injectable } from '@nestjs/common'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'
import { getIdFromScopeName } from '@shared/domain/space/space.helper'

@Injectable()
export class DiscussionEntityLinkProvider extends EntityLinkProvider<'discussion'> {
  protected async getRelativeLink(discussion: Discussion) {
    const note = await discussion.note.load()
    const spaceId = getIdFromScopeName(note.scope)

    return `/spaces/${spaceId}/discussions/${discussion.id}` as const
  }
}
