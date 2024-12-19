import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import fs from 'fs/promises'
import path from 'path'
import { EntityIconType } from '@shared/domain/entity/entity-icon/entity-icon.type'

@Injectable()
export class EntityIconService {
  @ServiceLogger()
  private readonly logger: Logger
  // TODO(PFDA-4835) - use imports after introducing bundler with nestjs
  private readonly ASSET_PATH = path.join(
    __dirname,
    '../../../../../../../../../libs/shared/src/domain/entity/entity-icon/assets',
  )

  private readonly ICON_MAP: Record<EntityIconType, Promise<string>>

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
    }
  }

  async getIcon(entityType: EntityIconType): Promise<string> {
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
