import {
  Entity,
  Ref,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

// intentionally doesn't extend BaseEntity, because it doesn't contain all its fields
@Entity({ tableName: 'comparison_inputs' })
export class ComparisonInput {
  @PrimaryKey()
  id: number

  @Property()
  role: string

  @ManyToOne({ entity: () => Comparison })
  comparison!: Ref<Comparison>

  @ManyToOne({ entity: () => UserFile })
  userFile!: Ref<UserFile>

  constructor(comparison: Comparison, userFile: UserFile) {
    this.comparison = Reference.create(comparison)
    this.userFile = Reference.create(userFile)
  }
}
