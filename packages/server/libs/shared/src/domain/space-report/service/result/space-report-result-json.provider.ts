import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceReport } from '@shared/domain/space-report/entity/space-report.entity'
import { SpaceReportResultProvider } from '@shared/domain/space-report/service/result/space-report-result.provider'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class SpaceReportResultJsonProvider extends SpaceReportResultProvider<'JSON'> {
  constructor(private readonly em: SqlEntityManager) {
    super()
  }

  async provide(spaceReport: SpaceReport<'JSON'>): Promise<string> {
    const result = {
      createdAt: spaceReport.createdAt,
      createdBy: spaceReport.createdBy.getEntity().fullName,
      space: await this.getSpace(spaceReport),
    }

    if (spaceReport.options.prettyPrint) {
      return JSON.stringify(result, null, 2)
    }

    return JSON.stringify(result)
  }

  private async getSpace(spaceReport: SpaceReport<'JSON'>): Promise<{
    title: string
    entities: Record<string, unknown>
    id?: number
    description?: string
  }> {
    if (EntityScopeUtils.isSpaceScope(spaceReport.scope)) {
      const space = await this.em.findOneOrFail(Space, EntityScopeUtils.getSpaceIdFromScope(spaceReport.scope))

      return {
        id: space.id,
        title: this.getTitleText(spaceReport.createdBy.getEntity(), space),
        description: space.description,
        entities: this.getEntities(spaceReport),
      }
    }

    return {
      title: this.getTitleText(spaceReport.createdBy.getEntity()),
      entities: this.getEntities(spaceReport),
    }
  }

  private getEntities(spaceReport: SpaceReport<'JSON'>): Record<string, unknown> {
    const parts = this.getReportPartsMap(spaceReport)

    return Object.entries(parts).reduce((acc, [sourceType, parts]) => {
      acc[`${sourceType}s`] = parts.map(part => part.result)
      return acc
    }, {})
  }
}
