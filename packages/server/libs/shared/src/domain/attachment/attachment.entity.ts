import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core'
import { Note } from '@shared/domain/note/note.entity'
import { AttachmentRepository } from '@shared/domain/attachment/attachment.repository'

export type ItemType = 'Node' | 'Job' | 'App' | 'Workflow' | 'Comparison' | 'Asset' | 'UserFile'

@Entity({ tableName: 'attachments', repository: () => AttachmentRepository })
export class Attachment {
  @PrimaryKey()
  id: number

  @ManyToOne(() => Note)
  note: Ref<Note>

  @Property()
  itemId: number

  @Property({ nullable: false })
  itemType: ItemType

  constructor(itemId: number, itemType: ItemType, note: Note) {
    this.note = Reference.create(note)
    this.itemId = itemId
    this.itemType = itemType
  }
}
