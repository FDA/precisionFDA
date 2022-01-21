import { Collection, Entity, EntityRepositoryType, Enum, IdentifiedReference, OneToMany, OneToOne, Property, Reference } from "@mikro-orm/core";
import { BaseEntity } from '../../database/base-entity'
import { ExpertQuestion } from "../expert-question";
import { User } from "../user";
import { ExpertRepository } from "./expert.repository";

export enum ExpertState {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum ExpertScope {
  PUBLIC = 'public'
}

@Entity({ tableName: 'experts', customRepository: () => ExpertRepository})
export class Expert extends BaseEntity {

  @OneToOne({ entity: () => User, mappedBy: 'expert' })
  user: IdentifiedReference<User>

  @OneToMany({ entity: () => ExpertQuestion, mappedBy: 'expert' })
  question = new Collection<ExpertQuestion>(this);

  @Enum({ nullable: true })
  scope?: ExpertScope

  @Enum({ nullable: true })
  state?: ExpertState 

  // TODO(samuel) Add JSON serializing and deserializing
  @Property({ type: 'text'})
  meta?: string

  @Property({ type: 'varchar' })
  image?: string

  [EntityRepositoryType]?: ExpertRepository;

  constructor(user: User) {
    super()
    this.user = Reference.create(user);
  }  
}
