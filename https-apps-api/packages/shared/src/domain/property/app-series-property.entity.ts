import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { GeneralProperty } from "./property.entity";
import { AppSeries } from "../app-series";

@Entity({ discriminatorValue: 'appSeries' })
export class AppSeriesProperty extends GeneralProperty {

    @ManyToOne(() => AppSeries, { joinColumn: 'target_id' })
    appSeries: Ref<AppSeries>
}
