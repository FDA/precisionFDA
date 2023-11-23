import { PropertyType } from "./property.entity";

type SetPropertiesInput = {
    targetId: number,
    targetType: PropertyType
    properties: object
}

type GetValidKeysInput = {
    scope: string,
    targetType: PropertyType
}

export {
    SetPropertiesInput,
    GetValidKeysInput
}