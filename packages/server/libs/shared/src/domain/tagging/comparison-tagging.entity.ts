import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'

@Entity({ discriminatorValue: TAGGABLE_TYPE.COMPARISON })
export class ComparisonTagging extends Tagging {
  @ManyToOne(() => Comparison, { joinColumn: 'taggable_id' })
  comparison: Ref<Comparison>
}
