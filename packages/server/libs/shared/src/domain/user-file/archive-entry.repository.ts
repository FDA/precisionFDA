import { EntityRepository } from '@mikro-orm/mysql'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'

export class ArchiveEntryRepository extends EntityRepository<ArchiveEntry> {
  async getArchiveEntriesForNode(nodeId: number): Promise<ArchiveEntry[]> {
    return await this.find({
      asset: nodeId,
    })
  }
}
