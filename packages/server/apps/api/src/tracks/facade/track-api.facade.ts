import { SqlEntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity';
import { Comparison } from '@shared/domain/comparison/comparison.entity';
import { Job } from '@shared/domain/job/job.entity';
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union';
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service';
import { UserContext } from '@shared/domain/user-context/model/user-context';
import { UserFile } from '@shared/domain/user-file/user-file.entity';
import { User } from '@shared/domain/user/user.entity';
import { STATIC_SCOPE } from '@shared/enums';

type TrackResourceType = 'app' | 'job' | 'file'
type TrackType = 'comparison' | TrackResourceType

@Injectable()
export class TrackApiFacade {
  private readonly sourceTypeToRepositoryMap
  private readonly nameKeyMap

  constructor(
    private readonly user: UserContext,
    private readonly em: SqlEntityManager,
    private readonly entityProvenanceService: EntityProvenanceService,
  ) {
    this.sourceTypeToRepositoryMap = {
      app: em.getRepository(App),
      job: em.getRepository(Job),
      file: em.getRepository(UserFile),
    } satisfies Record<TrackResourceType, object>

    this.nameKeyMap = {
      app: 'title',
      job: 'name',
      file: 'name',
      comparison: 'name',
    } satisfies Record<TrackType, string>
  }

  private async getComparisonById(id: number) {
    return this.em.findOneOrFail(Comparison, { id, user: this.user.id })
  }

  private async getResourceEntity(uid: string, type: TrackResourceType) {
    const user = await this.em.findOneOrFail(User,
      { id: this.user.id },
      { populate: ['spaceMemberships', 'spaceMemberships.spaces'] },
    )

    const viewableSpaces = []
    user.spaceMemberships.getItems().filter(m => m.active).forEach(spaceMembership => {
      spaceMembership.spaces.getItems().forEach(space => viewableSpaces.push(`space-${space.id}`))
    })
    const entity = await this.sourceTypeToRepositoryMap[type].findOneOrFail({ uid }, {
      filters: {
        accessibleBy: {
          userId: this.user.id,
          spaceScopes: [...viewableSpaces, STATIC_SCOPE.PUBLIC],
        }
      },
    })
    return entity
  }

  async getProvenance(uid: string) {
    const [type, id] = uid.split('-') as [TrackType, number | string]
    const entity = type === 'comparison' ?
        await this.getComparisonById(id as number) :
        await this.getResourceEntity(uid, type)
    const entityProvenanceSource = { type, entity } as EntityProvenanceSourceUnion
    const entityProvenance = await this.entityProvenanceService.getEntityProvenance(
      entityProvenanceSource,
      'svg',
      { omitStyles: false, pixelated: true },
    )
    return {
      uid,
      name: entity[this.nameKeyMap[type] || 'name'],
      svg: entityProvenance,
    }
  }
}