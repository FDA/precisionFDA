import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { Node } from "../user-file";
import { GeneralProperty } from "./property.entity";

@Entity({ discriminatorValue: 'node' })
export class NodeProperty extends GeneralProperty {

    @ManyToOne(() => Node, { joinColumn: 'target_id' })
    node: Ref<Node>
}
