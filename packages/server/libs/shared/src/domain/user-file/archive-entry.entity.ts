import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ArchiveEntryRepository } from '@shared/domain/user-file/archive-entry.repository'
import { Asset } from '@shared/domain/user-file/asset.entity'

@Entity({ tableName: 'archive_entries', repository: () => ArchiveEntryRepository })
export class ArchiveEntry {
  @PrimaryKey()
  id!: number

  @Property({ type: 'text' })
  path: string

  @Property({ nullable: true })
  name?: string

  @ManyToOne(() => Asset)
  asset: Asset
}
