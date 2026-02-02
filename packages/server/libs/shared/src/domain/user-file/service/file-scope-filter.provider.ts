import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import {
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
  PARENT_TYPE,
} from '@shared/domain/user-file/user-file.types'

/**
 * Scope filter provider for UserFile entities.
 * Adds base conditions to filter out non-files, removing files, and comparison files.
 */
@Injectable()
export class FileScopeFilterProvider extends AbstractScopeFilterProvider<UserFile> {
  protected override getBaseCondition(): Partial<FilterQuery<UserFile>> {
    return {
      stiType: FILE_STI_TYPE.USERFILE,
      state: { $ne: FILE_STATE_PFDA.REMOVING },
      parentType: { $ne: null, $nin: [PARENT_TYPE.COMPARISON] },
    }
  }
}
