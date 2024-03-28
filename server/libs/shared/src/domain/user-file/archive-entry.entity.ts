import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Asset } from '@shared/domain/user-file/asset.entity'

@Entity({ tableName: 'archive_entries' })
export class ArchiveEntry {
  @PrimaryKey()
  id!: number

  @Property({ type: 'text' })
  path: string

  @Property()
  name: string

  @ManyToOne(() => Asset)
  asset: Asset
}
