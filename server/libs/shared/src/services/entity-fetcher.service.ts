import type { SqlEntityManager } from '@mikro-orm/mysql'
import type { EntityName, FilterQuery, ObjectQuery } from '@mikro-orm/core'
import type { FindOneOptions, FindOptions } from '@mikro-orm/core'
import { Answer } from '@shared/domain/answer/answer.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { ServiceError } from '@shared/errors'
import type { UserCtx } from '../types'
import { STATIC_SCOPE } from '../enums'
import { CAN_EDIT_ROLES } from '../domain/space-membership/space-membership.helper'
import { defaultLogger as logger } from '../logger'
import { getIdFromScopeName } from '../domain/space/space.helper'


export type UID<PREFIX extends string> = `${PREFIX}-${string}-${number}`

interface IdEntity {
  id: number
}

interface UidEntity {
  uid: UID<string>
}

/**
 * This service is used to fetch entities from the database.
 * E - ENTITY - entity type to fetch.
 * H - HINT - used to specify the relations to populate. Some magic is making it work - do not touch it.
 */
export class EntityFetcherService {
  private readonly em: SqlEntityManager
  private readonly currentUserId: number
  private isInitialized: boolean
  private isSiteAdmin: boolean
  private editableSpaces: string[]
  private accessibleSpaces: string[]

  constructor(em: SqlEntityManager, userCtx: UserCtx) {
    this.em = em
    this.currentUserId = userCtx.id
    this.isInitialized = false
  }

  // Not sure if this is the best approach, we often do not need init the spaces for many queries.
  private async checkInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  private async initialize(): Promise<void> {
    const user = await this.em.findOneOrFail(User, { id: this.currentUserId }, { populate: ['spaceMemberships.spaces'] })
    // const user = await this.em.findOneOrFail(User, { id: 3 }, { populate: ['spaceMemberships.spaces'] })

    const editable = Array.from(user.spaceMemberships)
      .filter(m => m.active && CAN_EDIT_ROLES.includes(m.role))
      .flatMap(spaceMembership => Array.from(spaceMembership.spaces).map(space => `space-${space.id}`))

    const accessible = Array.from(user.spaceMemberships)
      .filter(m => m.active)
      .flatMap(spaceMembership => Array.from(spaceMembership.spaces).map(space => `space-${space.id}`))

    this.isSiteAdmin = await user.isSiteAdmin()
    this.editableSpaces = editable
    this.accessibleSpaces = accessible
    this.isInitialized = true
    logger.debug('EntityFetcher initialized')
  }

  private privateScopeCondition(classType?: any) {
    if (this.isDiscussionOrAnswer(classType)) {
      return { note: { scope: STATIC_SCOPE.PRIVATE, user: this.currentUserId } }
    }
    if (this.isSpace(classType)) {
      throw new Error('Invalid class type for private scope condition')
    }
    return { scope: STATIC_SCOPE.PRIVATE, user: this.currentUserId }
  }

  private ownerScopeCondition(): { scope: [STATIC_SCOPE.PUBLIC, STATIC_SCOPE.PRIVATE], user: number } {
    return { scope: [STATIC_SCOPE.PUBLIC, STATIC_SCOPE.PRIVATE], user: this.currentUserId }
  }

  private publicScopeCondition(classType?: any) {
    if (this.isDiscussionOrAnswer(classType)) {
      return { note: { scope: STATIC_SCOPE.PUBLIC } }
    }
    if (this.isSpace(classType)) {
      throw new Error('Invalid class type for public scope condition')
    }
    return { scope: STATIC_SCOPE.PUBLIC }
  }

  private spaceScopeCondition(spaceId: number, classType: any) {
    if (spaceId <= 0) {
      throw new Error('Invalid space id')
    }
    if (this.isDiscussionOrAnswer(classType)) {
      return { note: { scope: `space-${spaceId}` } }
    }
    if (this.isSpace(classType)) {
      throw new Error('Invalid class type for space scope condition')
    }
    return { scope: `space-${spaceId}` }
  }

  private accessibleByCurrentUserCondition<E extends UidEntity | IdEntity>(classType: EntityName<E>) {
    if (this.isDiscussionOrAnswer(classType)) {
      return {
        note: {
          $or: [
            this.privateScopeCondition(),
            this.publicScopeCondition(),
            { scope: { $in: this.accessibleSpaces } },
          ],
        },
      }
    }
    if (this.isSpace(classType)) {
      return {
        id: { $in: this.accessibleSpaces.map(getIdFromScopeName) },
      }
    }

    // todo: define condition for entities like: news, licences, challenges, data-portals
    return {
      $or: [
        this.privateScopeCondition(),
        this.publicScopeCondition(),
        { scope: { $in: this.accessibleSpaces } },
      ],
    }
  }

  private editableByCurrentUserCondition<E extends UidEntity | IdEntity>(classType: EntityName<E>) {
    if (this.isDiscussionOrAnswer(classType)) {
      return {
        note: {
          $or: [
            this.ownerScopeCondition(),
            { scope: { $in: this.editableSpaces } },
          ],
        },
      }
    }
    if (this.isSpace(classType)) {
      return {
        id: { $in: this.editableSpaces.map(getIdFromScopeName) },
      }
    }
    if (this.isDiscussionCommentOrAnswerComment(classType)) {
      return {
        commentableId: {
          note: {
            $or: [
              this.ownerScopeCondition(),
              { scope: { $in: this.editableSpaces } },
            ],
          },
        }
      }
    }
    // todo: define special condition for other entities like: news, licences, challenges, data-portals
    return {
      $or: [
        this.ownerScopeCondition(),
        { scope: { $in: this.editableSpaces } },
      ],
    }
  }

  private hasScope(classType: any): boolean {
    return [UserFile].includes(classType)
  }

  private isDiscussionOrAnswer(classType: any): boolean {
    return [Answer, Discussion].includes(classType)
  }

  private isDiscussionCommentOrAnswerComment(classType: any): classType is AnswerComment | DiscussionComment {
    return [AnswerComment, DiscussionComment].includes(classType)
  }

  private isSpace(classType: any): classType is Space {
    return classType === Space
  }


  // eslint-disable-next-line max-len
  async getAccessible<E extends UidEntity | IdEntity, H extends string = never>(type: EntityName<E>, where?: ObjectQuery<E>, options?: FindOptions<E, H>) {
    await this.checkInitialized()
    return this.em.find(type, { ...this.accessibleByCurrentUserCondition(type), ...where } as FilterQuery<E>, options)
  }

  // eslint-disable-next-line max-len
  async getEditable<E extends UidEntity | IdEntity, H extends string = never>(type: EntityName<E>, where?: ObjectQuery<E>, options?: FindOptions<E, H>) {
    await this.checkInitialized()
    return this.em.find(type, { ...this.editableByCurrentUserCondition(type), ...where } as FilterQuery<E>, options)
  }

  async getByUids<E extends UidEntity, H extends string = never>(type: EntityName<E>, uids: Array<E['uid']>, where?: ObjectQuery<E>, options?: FindOptions<E, H>) {
    if (uids.length === 0) {
      return []
    }
    await this.checkInitialized()
    return this.em.find(type, { uid: { $in: uids }, ...where } as FilterQuery<E>, options)
  }

  async getByIds<E extends IdEntity, H extends string = never>(type: EntityName<E>, ids: Array<E['id']>, where?: ObjectQuery<E>, options?: FindOptions<E, H>) {
    if (ids.length === 0) {
      return []
    }
    await this.checkInitialized()
    return this.em.find(type, { id: { $in: ids }, ...where } as FilterQuery<E>, options)
  }

  async getAccessibleById<E extends IdEntity, H extends string = never>(type: EntityName<E>, id: E['id'], where?: ObjectQuery<E>, options?: FindOneOptions<E, H>) {
    await this.checkInitialized()
    if (this.isSpace(type) && id != null) {
      throw new ServiceError('Currently unsupported for spaces')
    }
    return this.em.findOne(type, { ...{ ...this.accessibleByCurrentUserCondition(type), id }, ...where } as FilterQuery<E>, options)
  }

  async getEditableById<E extends IdEntity, H extends string = never>(type: EntityName<E>, id: E['id'], where?: ObjectQuery<E>, options?: FindOneOptions<E, H>) {
    await this.checkInitialized()
    if (this.isSpace(type) && id != null) {
      throw new ServiceError('Currently unsupported for spaces')
    }
    return this.em.findOne(type, { ...this.editableByCurrentUserCondition(type), ...where, id } as FilterQuery<E>, options)
  }

  async getAccessibleByUid<E extends UidEntity, H extends string = never>(type: EntityName<E>, uid: E['uid'], where?: ObjectQuery<E>, options?: FindOptions<E, H>) {
    await this.checkInitialized()
    return this.em.findOne(type, { ...this.accessibleByCurrentUserCondition(type), ...where, uid } as FilterQuery<E>, options)
  }

  async getEditableByUid<E extends UidEntity, H extends string = never>(type: EntityName<E>, uid: E['uid'], where?: ObjectQuery<E>, options?: FindOptions<E, H>) {
    await this.checkInitialized()
    return this.em.findOne(type, { ...this.editableByCurrentUserCondition(type), ...where, uid } as FilterQuery<E>, options)
  }

  async getByUid<E extends UidEntity>(type: EntityName<E>, uid: E['uid']) {
    await this.checkInitialized()
    return this.em.findOne(type, { uid } as FilterQuery<E>)
  }

  async getById<E extends IdEntity, H extends string = never>(type: EntityName<E>, id: E['id'], options?: FindOptions<E, H>) {
    await this.checkInitialized()
    return this.em.findOne(type, { id } as FilterQuery<E>, options)
  }

  async getPublic<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    await this.checkInitialized()
    return this.em.find(type, { ...this.publicScopeCondition(type), ...where } as FilterQuery<E>, options)
  }

  async getPrivate<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    await this.checkInitialized()
    return this.em.find(type, { ...this.privateScopeCondition(type), ...where } as FilterQuery<E>, options)
  }

  async getFromSpace<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    spaceId: number,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    await this.checkInitialized()
    return this.em.find(type, { ...this.spaceScopeCondition(spaceId, type), ...where } as FilterQuery<E>, options)
  }
}
