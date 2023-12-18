import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core'
import { Note } from '../note'

export type ItemType = 'Node' | 'Job' | 'App' | 'Workflow' | 'Comparison'

@Entity({ tableName: 'attachments' })
export class Attachment {
  @PrimaryKey()
  id: number

  @ManyToOne(() => Note)
  note: Ref<Note>

  @Property()
  itemId: number

  @Property({nullable: false})
  itemType: ItemType

  constructor(note: Note) {
    this.note = Reference.create(note)
  }
}
