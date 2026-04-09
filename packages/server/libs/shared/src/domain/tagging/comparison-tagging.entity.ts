import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

@Entity({ discriminatorValue: TAGGABLE_TYPE.COMPARISON })
export class ComparisonTagging extends Tagging {
  @ManyToOne(() => Comparison, { joinColumn: 'taggable_id' })
  comparison: Ref<Comparison>
}
