import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { ArchiveEntryRepository } from '@shared/domain/user-file/archive-entry.repository'
import { SqlEntityManager } from '@mikro-orm/mysql'

@Injectable()
export class ArchiveEntryService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly archiveEntryRepo: ArchiveEntryRepository,
  ) {}

  async removeArchiveEntriesForNode(nodeId: number): Promise<void> {
    this.logger.log(`Removing archive entries for node with id ${nodeId}`)
    return await this.em.transactional(async () => {
      const archiveEntries = await this.archiveEntryRepo.getArchiveEntriesForNode(nodeId)
      archiveEntries.forEach((archiveEntry) => {
        this.em.remove(archiveEntry)
      })
    })
  }
}
