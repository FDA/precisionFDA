import { FilterQuery } from '@mikro-orm/core/typings'
import { GetValidKeysInput, SetPropertiesInput } from '../property.input'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { GeneralProperty, PropertyType } from '../property.entity'
import * as errors from '../../../errors'
import { PermissionError } from '../../../errors'
import { Node } from '../../user-file'
import { Job } from '../../job'
import { DbCluster } from '../../db-cluster'
import { getIdFromScopeName, scopeContainsId } from '../../space/space.helper'
import { SPACE_STATE } from '../../space/space.enum'
import { CAN_EDIT_ROLES } from '../../space-membership/space-membership.helper'
import { User } from '../../user'
import { UserCtx } from '../../../types'
import { FILE_STI_TYPE } from '../../user-file/user-file.types'
import { WorkflowSeries } from '../../workflow-series'
import { AppSeries } from '../../app-series'
import { Space } from '../../space'
import { NodeProperty } from '../node-property.entity'

type SetPropertiesResponse = {
  message: string,
}

export interface IPropertyService {
  setProperty: (input: SetPropertiesInput) => Promise<SetPropertiesResponse>
  getValidKeys: (input: GetValidKeysInput) => Promise<string[]>
}

export class PropertyService implements IPropertyService {

  private readonly em: SqlEntityManager
  private readonly userCtx: UserCtx

  constructor(em: SqlEntityManager, ctx: UserCtx) {
    this.em = em
    this.userCtx = ctx
  }

  async setProperty(input: SetPropertiesInput): Promise<SetPropertiesResponse> {
    const targetType = input.targetType
    const targetId = input.targetId
    await this.checkTypeAndPermissions(targetType, targetId)

    try {
      await this.em.begin()
      const currentProperties: GeneralProperty[] = await this.em.find(GeneralProperty,
        {
          targetType,
          targetId,
        })

      this.em.remove(currentProperties)

      for (let key in input.properties) {
        const newProperty = new GeneralProperty()
        newProperty.targetId = targetId
        newProperty.targetType = targetType
        newProperty.propertyName = key
        // @ts-ignore
        newProperty.propertyValue = input.properties[key]
        this.em.persist(newProperty)
      }
      await this.em.flush()
      await this.em.commit()
    } catch (e) {
      await this.em.rollback()
      throw e
    }
    return Promise.resolve({ message: 'success' })
  }

  async getValidKeys(input: GetValidKeysInput): Promise<string[]> {

    // if space-scope supplied, check permissions
    if (scopeContainsId(input.scope)) {
      const space = await this.em.findOneOrFail(
        Space,
        {
          id: getIdFromScopeName(input.scope),
          state: SPACE_STATE.ACTIVE,
          spaceMemberships: {
            user: {
              id: this.userCtx.id,
            },
          },
        })
    }

    // tried using qb and distinct - couldn't make it work.
    const results: GeneralProperty[] = await this.em.find(
      this.getEntityByType(input.targetType),
      this.getConditionByType(input, this.userCtx),
    )

    const res = new Set(results.map(p => p.propertyName))
    return Promise.resolve([...res])
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

  private getConditionByType(input: { scope: string, targetType: PropertyType }, user: UserCtx) {
    const condition: FilterQuery<any> = {}
    if (input.scope === 'spaces') input.scope = 'space-%'
    switch (input.targetType) {
      case 'node':
        condition['node'] = {
          scope: { $like: input.scope },
          stiType: [FILE_STI_TYPE.FOLDER, FILE_STI_TYPE.USERFILE],
        }
        break
      case 'asset':
        condition['node'] = {
          scope: { $like: input.scope },
          stiType: [FILE_STI_TYPE.ASSET],
        }
        break
      case 'workflowSeries':
      case 'appSeries':
      case 'job':
      case 'dbCluster':
        condition[input.targetType] = {
          scope: { $like: input.scope },
        }
        break
      default:
        throw new errors.ValidationError('Unsupported type!')
    }

    if (input.scope == 'private') {
      if (input.targetType == 'asset') {
        condition['node'] = { ...condition['node'], user: user.id }
      } else {
        condition[input.targetType] = { ...condition[input.targetType], user: user.id }
      }
    }

    return condition
  }

  private async checkTypeAndPermissions(targetType: PropertyType, targetId: number): Promise<void> {
    let targetEntity
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
    const user = this.userCtx
    const target: Node | WorkflowSeries | Job | AppSeries | DbCluster = await this.em.findOneOrFail(targetEntity, { id: targetId })

    if (target.scope == 'private' && target.user?.id !== user.id) {
      throw new PermissionError()
    }
    // space scope
    else if (target.scope && scopeContainsId(target.scope)) {
      const space = await this.em.findOne(
        Space,
        {
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
