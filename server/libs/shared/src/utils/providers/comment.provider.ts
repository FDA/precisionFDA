import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { Comment } from '../../domain/comment/comment.entity'
import { EntityDataProvider } from './entity-data.provider'

export class CommentEntityDataProvider extends EntityDataProvider<'comment'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.COMMENT
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.COMMENT
  protected readonly spaceEventDataKeys: Extract<keyof Comment, string>[] = ['body']
}
