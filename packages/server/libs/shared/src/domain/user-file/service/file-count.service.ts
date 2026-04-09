import { EntityManager, EntityName } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FileScopeFilterProvider } from './file-scope-filter.provider'

@Injectable()
export class FileCountService extends AbstractCountService<UserFile> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<UserFile>
  protected readonly entityClass: EntityName<UserFile> = UserFile

  constructor(em: SqlEntityManager, fileScopeFilterProvider: FileScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = fileScopeFilterProvider
  }
}
