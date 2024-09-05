import { EntityRepository } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/mysql'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { User } from '@shared/domain/user/user.entity'
import { Job } from '../job/job.entity'
import { Asset } from './asset.entity'
import { ITrackable, PARENT_TYPE } from './user-file.types'

// The parentId and parentType columns of a node determines the parent element
// parentType can be a User, a Job, a Comparison or another Node

const getRepositoryForParentType = (
  parentType: PARENT_TYPE,
  em: EntityManager,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): EntityRepository<any> | null => {
  if (parentType === PARENT_TYPE.USER) {
    return em.getRepository(User)
  }
  if (parentType === PARENT_TYPE.JOB) {
    return em.getRepository(Job)
  }
  if (parentType === PARENT_TYPE.ASSET) {
    return em.getRepository(Asset)
  }
  if (parentType === PARENT_TYPE.COMPARISON) {
    return em.getRepository(Comparison)
  }
  return null
}

// Find the parent element from where element originated
const findParentEntity = async (
  em: EntityManager,
  parent: ITrackable,
): Promise<User | Job | Asset | Comparison | null> => {
  const repo = getRepositoryForParentType(parent.parentType, em)
  if (!repo) {
    return null
  }
  return await repo.findOne({ id: parent.parentId })
}

export {
  getRepositoryForParentType,
  findParentEntity,
}
