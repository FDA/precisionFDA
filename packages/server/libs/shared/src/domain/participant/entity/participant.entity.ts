import { Entity, Enum, ManyToOne, Property, Ref } from '@mikro-orm/core'
import { ParticipantRepository } from '@shared/domain/participant/repository/participant.repository'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { BaseEntity } from '../../../database/base.entity'

export enum ParticipantKind {
  INVISIBLE = 0,
  ORG = 1,
  PERSON = 2,
}

@Entity({ tableName: 'participants', repository: () => ParticipantRepository })
export class Participant extends BaseEntity {
  @Property({ type: 'varchar', nullable: true })
  title?: string

  @Property({ fieldName: 'image_url', type: 'varchar', nullable: true })
  imageUrl?: string

  @ManyToOne({
    entity: () => UserFile,
    fieldName: 'node_id',
    nullable: true,
  })
  file?: Ref<UserFile>

  @Property({ nullable: true })
  public?: boolean

  @Enum({ items: () => ParticipantKind, nullable: true, default: ParticipantKind.INVISIBLE })
  kind?: ParticipantKind

  @Property({ nullable: true, default: 0 })
  position?: number
}
