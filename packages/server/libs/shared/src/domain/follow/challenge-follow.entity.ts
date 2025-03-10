import { Follow } from '@shared/domain/follow/follow.entity'
import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Challenge } from '@shared/domain/challenge/challenge.entity'

@Entity({ discriminatorValue: 'Challenge' })
export class ChallengeFollow extends Follow {
  @ManyToOne({ entity: () => Challenge, fieldName: 'followable_id' })
  followableId: Ref<Challenge>
}
