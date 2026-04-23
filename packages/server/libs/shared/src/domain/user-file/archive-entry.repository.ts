import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'

export class ArchiveEntryRepository extends BaseEntityRepository<ArchiveEntry> {
  async getArchiveEntriesForNode(nodeId: number): Promise<ArchiveEntry[]> {
    return await this.find({
      asset: nodeId,
    })
  }
}
