import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core'
import { Note } from '../note'

@Entity({ tableName: 'attachments' })
export class Attachment {
  @PrimaryKey()
  id: number

  @ManyToOne(() => Note)
  note: Ref<Note>

  @Property()
  item_id: number

  @Property()
  item_type: string

  constructor(note: Note) {
    this.note = Reference.create(note)
  }
}
