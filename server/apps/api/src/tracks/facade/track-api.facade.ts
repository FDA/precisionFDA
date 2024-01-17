import { SqlEntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common'
import { App } from '@shared/domain/app/app.entity';
import { Job } from '@shared/domain/job/job.entity';
import { EntityProvenanceSourceUnion } from '@shared/domain/provenance/model/entity-provenance-source-union';
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service';
import { UserContext } from '@shared/domain/user-context/model/user-context';
import { UserFile } from '@shared/domain/user-file/user-file.entity';
import { User } from '@shared/domain/user/user.entity';
import { STATIC_SCOPE } from '@shared/enums';

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
    }

    this.nameKeyMap = {
      app: 'title',
      job: 'name',
      file: 'name',
    }
  }

  async getProvenance(uid) {
    const type = uid.split('-')[0]
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
    const entityProvenanceSource = { type, entity } as EntityProvenanceSourceUnion
    const entityProvenance = await this.entityProvenanceService.getEntityProvenance(
      entityProvenanceSource,
      'svg',
      { omitStyles: false, pixelated: true },
    )
    return {
      uid,
      name: entity[this.nameKeyMap[type] || 'name'],
      svg: entityProvenance.replace(/undefined/g, ''),
    }
  }
}