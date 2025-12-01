import { Injectable } from '@nestjs/common'
import { SpaceMembershipRepository } from './space-membership.repository'
import { SpaceMembership } from './space-membership.entity'

@Injectable()
export class SpaceMembershipService {
  constructor(private readonly spaceMembershipRepository: SpaceMembershipRepository) {}

  getCurrentMembership(spaceId: number, userId: number): Promise<SpaceMembership> {
    return this.spaceMembershipRepository.getMembership(spaceId, userId)
  }
}
