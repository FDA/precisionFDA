import { EntityRepository } from '@mikro-orm/mysql'
import { Comment } from './comment.entity'

export class CommentRepository extends EntityRepository<Comment> {}
