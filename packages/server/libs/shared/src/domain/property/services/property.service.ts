import { EntityName, FilterQuery } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { Job } from '@shared/domain/job/job.entity'
import { CreatePropertyDTO } from '@shared/domain/property/dto/CreatePropertyDTO'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { HOME_SCOPE, Scope, STATIC_SCOPE } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import * as errors from '../../../errors'
import { CAN_EDIT_ROLES } from '../../space-membership/space-membership.helper'
import { SPACE_STATE } from '../../space/space.enum'
import { getIdFromScopeName, scopeContainsId } from '../../space/space.helper'
import { Node } from '../../user-file/node.entity'
import { FILE_STI_TYPE } from '../../user-file/user-file.types'
import { GeneralProperty, PropertyType } from '../property.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

export interface IPropertyService {
  setProperty: (input: CreatePropertyDTO) => Promise<void>
  getValidKeys: (scope: Scope, targetType: PropertyType) => Promise<string[]>
}

@Injectable()
export class PropertyService implements IPropertyService {
  @ServiceLogger()
  private readonly logger: Logger
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
  ) {}

  async setProperty(input: CreatePropertyDTO): Promise<void> {
    const targetType = input.targetType
    const targetId = input.targetId
    await this.checkTypeAndPermissions(targetType, targetId)

    await this.em.transactional(async () => {
      const currentProperties: GeneralProperty[] = await this.em.find(GeneralProperty, {
        targetType,
        targetId,
      })

      this.logger.log(
        `Deleting properties with target id: ${targetId} and type: ${targetType}`,
      )
      await this.em.removeAndFlush(currentProperties)
      this.logger.log(
        `Setting properties with target id: ${targetId} and type: ${targetType}`,
      )
      for (const key in input.properties) {
        const newProperty = new GeneralProperty()
        newProperty.targetId = targetId
        newProperty.targetType = targetType
        newProperty.propertyName = key
        newProperty.propertyValue = input.properties[key]
        this.em.persist(newProperty)
      }
      await this.em.flush()
    })
  }

  async getValidKeys(scope: string, targetType: PropertyType): Promise<string[]> {
    const results: GeneralProperty[] = await this.em.find(
      this.getEntityByType(targetType),
      await this.getConditionByType(scope, targetType),
    )

    return Promise.resolve([...new Set(results.map(p => p.propertyName))])
  }

  private getEntityByType(targetType: PropertyType) {
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
          scope: { $in: scopes},
          stiType: [FILE_STI_TYPE.FOLDER, FILE_STI_TYPE.USERFILE],
        }
        break
      case 'asset':
        condition['node'] = {
          scope: { $in: scopes},
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

  private async checkTypeAndPermissions(targetType: PropertyType, targetId: number): Promise<void> {
    let targetEntity: EntityName<Job | Node | WorkflowSeries | AppSeries | DbCluster>
    switch (targetType) {
      case 'node':
      case 'asset':
        targetEntity = 'Node'
        break
      case 'workflowSeries':
      case 'appSeries':
      case 'job':
      case 'dbCluster':
        // capitalize type for DbQuery
        targetEntity = targetType.charAt(0).toUpperCase() + targetType.slice(1)
        break
      default:
        throw new errors.ValidationError('Unsupported type!')
    }
    const user = this.user
    const target: Node | WorkflowSeries | Job | AppSeries | DbCluster = await this.em.findOneOrFail(
      targetEntity,
      { id: targetId },
    )

    if (target.scope == STATIC_SCOPE.PRIVATE && target.user?.id !== user.id) {
      throw new PermissionError()
    }
    // space scope
    else if (target.scope && scopeContainsId(target.scope)) {
      const space = await this.em.findOne(Space, {
        id: getIdFromScopeName(target.scope),
        state: SPACE_STATE.ACTIVE,
        spaceMemberships: {
          user: {
            id: user.id,
          },
          role: CAN_EDIT_ROLES,
        },
      })
      if (!space) {
        throw new PermissionError()
      }
      // public scope
    } else {
      const dbUser = await this.em.findOneOrFail(User, {
        id: user.id,
      })
      const isSiteAdmin = await dbUser.isSiteAdmin()

      if (!isSiteAdmin && target.user?.id !== user.id) {
        throw new PermissionError()
      }
    }
  }
}
