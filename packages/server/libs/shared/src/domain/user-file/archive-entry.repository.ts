import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { EntityRepository } from '@mikro-orm/mysql'

export class ArchiveEntryRepository extends EntityRepository<ArchiveEntry> {
  async getArchiveEntriesForNode(nodeId: number): Promise<ArchiveEntry[]> {
    return await this.find({
      asset: nodeId,
    })
  }
}
