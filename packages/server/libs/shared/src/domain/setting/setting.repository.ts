import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { Setting } from './setting.entity'

export class SettingRepository extends PaginatedRepository<Setting> {
  async findValueByKey(key: string): Promise<unknown | null> {
    const setting = await this.findOne({ key })
    return setting?.value ?? null
  }
}

