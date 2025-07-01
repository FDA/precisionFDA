import { Comment } from './comment.entity'
import { EntityRepository } from '@mikro-orm/mysql'

export class CommentRepository extends EntityRepository<Comment> {}
