import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { GeneralProperty } from '@shared/domain/property/property.entity'
import { Node } from '../user-file/node.entity'

@Entity({ discriminatorValue: 'node' })
export class NodeProperty extends GeneralProperty {

    @ManyToOne(() => Node, { joinColumn: 'target_id' })
    node: Ref<Node>
}
