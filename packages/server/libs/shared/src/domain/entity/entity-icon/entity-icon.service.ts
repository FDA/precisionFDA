import { Injectable, Logger } from '@nestjs/common'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import fs from 'fs/promises'
import path from 'path'

@Injectable()
export class EntityIconService {
  @ServiceLogger()
  private readonly logger: Logger
  // TODO(PFDA-4835) - use imports after introducing bundler with nestjs
  private readonly ASSET_PATH = path.join(
    __dirname,
    '../../../../../../../../../libs/shared/src/domain/entity/entity-icon/assets',
  )

  private readonly ICON_MAP: Record<EntityType, Promise<string>>

  constructor() {
    this.ICON_MAP = {
      app: this.getFile('app-icon.svg'),
      asset: this.getFile('asset-icon.svg'),
      comparison: this.getFile('comparison-icon.svg'),
      dbcluster: this.getFile('dbcluster-icon.svg'),
      file: this.getFile('file-icon.svg'),
      folder: this.getFile('folder-icon.svg'),
      job: this.getFile('job-icon.svg'),
      note: this.getFile('note-icon.svg'),
      user: this.getFile('user-icon.svg'),
      workflow: this.getFile('workflow-icon.svg'),
      discussion: Promise.resolve(''),
      resource: Promise.resolve(''),
    }
  }

  async getIcon(entityType: EntityType): Promise<string> {
    return (await this.ICON_MAP[entityType]) ?? ''
  }

  private async getFile(fileName: string) {
    try {
      return await fs.readFile(path.join(this.ASSET_PATH, fileName), 'utf8')
    } catch {
      this.logger.error(`Failed to load icon file: "${fileName}"`)
      return ''
    }
  }
}
