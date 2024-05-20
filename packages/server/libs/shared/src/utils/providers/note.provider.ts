import { Note } from '@shared/domain/note/note.entity'
import { ENTITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '../../domain/space-event/space-event.enum'
import { EntityDataProvider } from './entity-data.provider'

export class NoteEntityDataProvider extends EntityDataProvider<'note'> {
  public readonly entityType: ENTITY_TYPE = ENTITY_TYPE.NOTE
  public readonly spaceEventObjectType: SPACE_EVENT_OBJECT_TYPE = SPACE_EVENT_OBJECT_TYPE.NOTE
  protected readonly spaceEventDataKeys: Extract<keyof Note, string>[] = ['title']
}
