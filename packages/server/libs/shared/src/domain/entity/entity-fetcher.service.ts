import type {
  EntityName,
  FilterQuery,
  FindOneOptions,
  FindOptions,
  ObjectQuery,
} from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { Answer } from '@shared/domain/answer/answer.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { ServiceError } from '@shared/errors'
import { STATIC_SCOPE } from '../../enums'
import { CAN_EDIT_ROLES } from '../space-membership/space-membership.helper'
import { getIdFromScopeName } from '../space/space.helper'
import { Uid } from './domain/uid'

export interface IdEntity {
  id: number
}

export interface UidEntity {
  uid: Uid
}

/**
 * This service is used to fetch entities from the database.
 * E - ENTITY - entity type to fetch.
 * H - HINT - used to specify the relations to populate. Some magic is making it work - do not touch it.
 */
@Injectable()
export class EntityFetcherService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
  ) {}

  private async loadUserAndMemberships(): Promise<{
    user: User
    editableSpaces: string[]
    accessibleSpaces: string[]
  }> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const memberships = await user.spaceMemberships.loadItems({ populate: ['spaces'] })

    const editableSpaces = Array.from(memberships)
      .filter((m) => m.active && CAN_EDIT_ROLES.includes(m.role))
      .flatMap((spaceMembership) =>
        Array.from(spaceMembership.spaces).map((space) => `space-${space.id}`),
      )

    const accessibleSpaces = Array.from(memberships)
      .filter((m) => m.active)
      .flatMap((spaceMembership) =>
        Array.from(spaceMembership.spaces).map((space) => `space-${space.id}`),
      )
    return { user, editableSpaces, accessibleSpaces }
  }

  private privateScopeCondition(classType?: any) {
    if (this.isDiscussionOrAnswer(classType)) {
      return { note: { scope: STATIC_SCOPE.PRIVATE, user: this.user.id } }
    }
    if (this.isSpace(classType)) {
      throw new Error('Invalid class type for private scope condition')
    }
    return { scope: STATIC_SCOPE.PRIVATE, user: this.user.id }
  }

  private ownerScopeCondition(): {
    scope: [STATIC_SCOPE.PUBLIC, STATIC_SCOPE.PRIVATE]
    user: number
  } {
    return { scope: [STATIC_SCOPE.PUBLIC, STATIC_SCOPE.PRIVATE], user: this.user.id }
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

  private async accessibleByCurrentUserCondition<E extends UidEntity | IdEntity>(
    classType: EntityName<E>,
  ) {
    const { accessibleSpaces } = await this.loadUserAndMemberships()
    if (this.isDiscussionOrAnswer(classType)) {
      return {
        note: {
          $or: [
            this.privateScopeCondition(),
            this.publicScopeCondition(),
            { scope: { $in: accessibleSpaces } },
          ],
        },
      }
    }
    if (this.isSpace(classType)) {
      return {
        id: { $in: accessibleSpaces.map(getIdFromScopeName) },
      }
    }

    // todo: define condition for entities like: news, licences, challenges, data-portals
    return {
      $or: [
        this.privateScopeCondition(),
        this.publicScopeCondition(),
        { scope: { $in: accessibleSpaces } },
      ],
    }
  }

  private async editableByCurrentUserCondition<E extends UidEntity | IdEntity>(
    classType: EntityName<E>,
  ) {
    const { editableSpaces } = await this.loadUserAndMemberships()
    if (this.isDiscussionOrAnswer(classType)) {
      return {
        note: {
          $or: [this.ownerScopeCondition(), { scope: { $in: editableSpaces } }],
        },
      }
    }
    if (this.isSpace(classType)) {
      return {
        id: { $in: editableSpaces.map(getIdFromScopeName) },
      }
    }
    if (this.isDiscussionCommentOrAnswerComment(classType)) {
      return {
        commentableId: {
          note: {
            $or: [this.ownerScopeCondition(), { scope: { $in: editableSpaces } }],
          },
        },
      }
    }
    // todo: define special condition for other entities like: news, licences, challenges, data-portals
    return {
      $or: [this.ownerScopeCondition(), { scope: { $in: editableSpaces } }],
    }
  }

  private hasScope(classType: any): boolean {
    return [UserFile].includes(classType)
  }

  private isDiscussionOrAnswer(classType: any): boolean {
    return [Answer, Discussion].includes(classType)
  }

  private isDiscussionCommentOrAnswerComment(
    classType: any,
  ): classType is AnswerComment | DiscussionComment {
    return [AnswerComment, DiscussionComment].includes(classType)
  }

  private isSpace(classType: any): classType is Space {
    return classType === Space
  }

  async getEditableSpaces() {
    const { editableSpaces } = await this.loadUserAndMemberships()
    return editableSpaces
  }

  // eslint-disable-next-line max-len
  async getAccessible<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    return this.em.find(
      type,
      { ...(await this.accessibleByCurrentUserCondition(type)), ...where } as FilterQuery<E>,
      options,
    )
  }

  // eslint-disable-next-line max-len
  async getEditable<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    return this.em.find(
      type,
      { ...(await this.editableByCurrentUserCondition(type)), ...where } as FilterQuery<E>,
      options,
    )
  }

  async getByUids<E extends UidEntity, H extends string = never>(
    type: EntityName<E>,
    uids: Array<E['uid']>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    if (uids.length === 0) {
      return []
    }
    return this.em.find(type, { uid: { $in: uids }, ...where } as FilterQuery<E>, options)
  }

  async getByIds<E extends IdEntity, H extends string = never>(
    type: EntityName<E>,
    ids: Array<E['id']>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    if (ids.length === 0) {
      return []
    }
    return this.em.find(type, { id: { $in: ids }, ...where } as FilterQuery<E>, options)
  }

  async getAccessibleById<E extends IdEntity, H extends string = never>(
    type: EntityName<E>,
    id: E['id'],
    where?: ObjectQuery<E>,
    options?: FindOneOptions<E, H>,
  ) {
    if (this.isSpace(type) && id != null) {
      throw new ServiceError('Currently unsupported for spaces')
    }
    return this.em.findOne(
      type,
      {
        ...{ ...(await this.accessibleByCurrentUserCondition(type)), id },
        ...where,
      } as FilterQuery<E>,
      options,
    )
  }

  async getAccessibleByIds<E extends IdEntity, H extends string = never>(
    type: EntityName<E>,
    ids: E['id'][],
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    if (this.isSpace(type) && ids.length > 0) {
      throw new ServiceError('Currently unsupported for spaces')
    }

    return this.em.find(
      type,
      {
        ...{
          ...(await this.accessibleByCurrentUserCondition(type)),
          id: { $in: ids },
        },
        ...where,
      } as FilterQuery<E>,
      options,
    )
  }

  async getEditableById<E extends IdEntity, H extends string = never>(
    type: EntityName<E>,
    id: E['id'],
    where?: ObjectQuery<E>,
    options?: FindOneOptions<E, H>,
  ) {
    if (this.isSpace(type) && id != null) {
      throw new ServiceError('Currently unsupported for spaces')
    }
    return this.em.findOne(
      type,
      { ...(await this.editableByCurrentUserCondition(type)), ...where, id } as FilterQuery<E>,
      options,
    )
  }

  async getAccessibleByUid<E extends UidEntity, H extends string = never>(
    type: EntityName<E>,
    uid: E['uid'],
    where?: ObjectQuery<E>,
    options?: FindOneOptions<E, H>,
  ) {
    return this.em.findOne(
      type,
      { ...(await this.accessibleByCurrentUserCondition(type)), ...where, uid } as FilterQuery<E>,
      options,
    )
  }

  async getEditableByUid<
    E extends UidEntity,
    H extends string = never,
    F extends string = '*',
    EX extends string = never,
  >(
    type: EntityName<E>,
    uid: E['uid'],
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H, F, EX>,
  ) {
    return this.em.findOne(
      type,
      { ...(await this.editableByCurrentUserCondition(type)), ...where, uid } as FilterQuery<E>,
      options,
    )
  }

  async getByUid<E extends UidEntity>(type: EntityName<E>, uid: E['uid']) {
    return this.em.findOne(type, { uid } as FilterQuery<E>)
  }

  async getById<
    E extends IdEntity,
    H extends string = never,
    F extends string = '*',
    EX extends string = never,
  >(type: EntityName<E>, id: E['id'], options?: FindOptions<E, H, F, EX>) {
    return this.em.findOne(type, { id } as FilterQuery<E>, options)
  }

  async getPublic<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    return this.em.find(
      type,
      { ...this.publicScopeCondition(type), ...where } as FilterQuery<E>,
      options,
    )
  }

  async getPrivate<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    return this.em.find(
      type,
      { ...this.privateScopeCondition(type), ...where } as FilterQuery<E>,
      options,
    )
  }

  async getFromSpace<E extends UidEntity | IdEntity, H extends string = never>(
    type: EntityName<E>,
    spaceId: number,
    where?: ObjectQuery<E>,
    options?: FindOptions<E, H>,
  ) {
    return this.em.find(
      type,
      { ...this.spaceScopeCondition(spaceId, type), ...where } as FilterQuery<E>,
      options,
    )
  }
}
