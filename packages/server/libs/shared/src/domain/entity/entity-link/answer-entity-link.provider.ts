import { Injectable } from '@nestjs/common'
import { Answer } from '@shared/domain/answer/answer.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'

@Injectable()
export class AnswerEntityLinkProvider extends EntityLinkProvider<'answer'> {
  protected async getRelativeLink(answer: Answer): Promise<`/${string}`> {
    const scope = await answer.note.loadProperty('scope')

    if (this.MY_HOME_SCOPES.includes(scope)) {
      // currently not used and not working properly (page still in ruby)
      return this.getHomeLink(answer)
    }
    return await this.getSpaceLink(answer)
  }

  private getHomeLink(answer: Answer): `/${string}` {
    const discussionID = answer.discussion.id
    return `/home/discussions/${discussionID}/${this.getUrlSegment(answer)}` as const
  }

  private async getSpaceLink(answer: Answer): Promise<`/${string}`> {
    const note = await answer.note.load()
    const spaceID = note.getSpaceId()
    const discussionID = answer.discussion.id

    return `/spaces/${spaceID}/discussions/${discussionID}/${this.getUrlSegment(answer)}` as const
  }

  private getUrlSegment(answer: Answer): string {
    return `answers/${answer.id}`
  }
}
