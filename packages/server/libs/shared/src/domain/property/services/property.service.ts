import { FilterQuery } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import * as errors from '../../../errors'
import { SPACE_STATE } from '../../space/space.enum'
import { getIdFromScopeName, scopeContainsId } from '../../space/space.helper'
import { FILE_STI_TYPE } from '../../user-file/user-file.types'
import { GeneralProperty, PropertyType } from '../property.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PropertyRepository } from '@shared/domain/property/property.repository'
import { Property } from '@shared/domain/property/dto/set-properties.dto'

@Injectable()
export class PropertyService {
  @ServiceLogger()
  private readonly logger: Logger
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async setProperty({
    targetType,
    targetId,
    properties,
  }: {
    targetType: PropertyType
    targetId: number
    properties: Property
  }): Promise<void> {
    await this.em.transactional(async () => {
      // Delete existing properties
      const currentProperties = await this.propertyRepository.find({ targetType, targetId })

      this.logger.log(`Deleting properties with target id: ${targetId} and type: ${targetType}`)
      await this.em.removeAndFlush(currentProperties)

      // Create new properties in batch
      this.logger.log(`Setting properties with target id: ${targetId} and type: ${targetType}`)
      const newProperties = Object.entries(properties).map(([propertyName, propertyValue]) =>
        this.em.create(GeneralProperty, { targetId, targetType, propertyName, propertyValue }),
      )

      this.em.persist(newProperties)
    })
  }

  async getValidKeys(scope: string, targetType: PropertyType): Promise<string[]> {
    const results: GeneralProperty[] = await this.em.find(
      this.getEntityByType(targetType),
      await this.getConditionByType(scope, targetType),
    )

    return Promise.resolve([...new Set(results.map((p) => p.propertyName))])
  }

  private getEntityByType(targetType: PropertyType): string {
    switch (targetType) {
      case 'node':
      case 'asset':
        return 'NodeProperty'
      case 'workflowSeries':
        return 'WorkflowSeriesProperty'
      case 'appSeries':
        return 'AppSeriesProperty'
      case 'job':
        return 'JobProperty'
      case 'dbCluster':
        return 'DbClusterProperty'
      default:
        throw new errors.ValidationError('Unsupported type!')
    }
  }

  private async getConditionByType(scope: string, targetType: PropertyType) {
    const condition: FilterQuery<any> = {}
    let scopes: string[] = []

    if (scope === HOME_SCOPE.SPACES) {
      scopes = await this.em
        .find(Space, {
          spaceMemberships: {
            active: true,
            user: {
              id: this.user.id,
            },
          },
        })
        .then((spaces) => spaces.map((s) => `space-${s.id}`))
    } else if (scopeContainsId(scope)) {
      await this.em.findOneOrFail(Space, {
        id: getIdFromScopeName(scope),
        state: SPACE_STATE.ACTIVE,
        spaceMemberships: {
          user: {
            id: this.user.id,
          },
        },
      })
      scopes = [scope]
    }
    if (scope == STATIC_SCOPE.PRIVATE || scope == STATIC_SCOPE.PUBLIC) {
      scopes = [scope]
    }

    switch (targetType) {
      case 'node':
        condition['node'] = {
          scope: { $in: scopes },
          stiType: [FILE_STI_TYPE.FOLDER, FILE_STI_TYPE.USERFILE],
        }
        break
      case 'asset':
        condition['node'] = {
          scope: { $in: scopes },
          stiType: [FILE_STI_TYPE.ASSET],
        }
        break
      case 'workflowSeries':
      case 'appSeries':
      case 'job':
      case 'dbCluster':
        condition[targetType] = {
          scope: { $in: scopes },
        }
        break
      default:
        throw new errors.ValidationError('Unsupported type!')
    }

    if (scope == STATIC_SCOPE.PRIVATE) {
      if (targetType == 'asset') {
        condition['node'] = { ...condition['node'], user: this.user.id }
      } else {
        condition[targetType] = { ...condition[targetType], user: this.user.id }
      }
    }
    return condition
  }
}
