import { Injectable } from '@nestjs/common'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { EntityLinkProvider } from '@shared/domain/entity/entity-link/entity-link.provider'

@Injectable()
export class ChallengeEntityLinkProvider extends EntityLinkProvider<'challenge'> {
  protected async getRelativeLink(challenge: Challenge): Promise<`/challenges/${number}`> {
    return `/challenges/${challenge.id}` as const
  }
}
