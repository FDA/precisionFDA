export type GetObjValues<T> = T extends Record<PropertyKey, infer V> ? V : never

export type FlipKeysAndValues<
  ObjT extends Record<string | symbol | number, string | symbol | number>,
  Ast extends Record<string, {
    key: keyof ObjT
    value: ObjT[keyof ObjT]
  }> = {
    [key in keyof ObjT]: {
      key: key
      value: ObjT[key]
    }
  },
  AstValues extends GetObjValues<Ast> = GetObjValues<Ast>,
  Result = {
    [key in AstValues['value']]: Extract<AstValues, { value: key }>['key']
  }
> = Result

export type MapKeysByObj<
  ObjT,
  Mapper extends Record<string, string>,
  MappedAstT extends Record<string, {
    key: string,
    value: ObjT[keyof ObjT]
  }> = {
    [key in Extract<keyof Mapper, keyof ObjT>]: {
      key: Mapper[key]
      value: ObjT[key]
    }
  },
  AstValues extends GetObjValues<MappedAstT> = GetObjValues<MappedAstT>,
  Result = {
    [K in AstValues['key']]: Extract<AstValues, { key: K }>['value']
  } & {
    [K in Exclude<keyof ObjT, keyof Mapper>]: ObjT[K]
  }
> = Result

export type NonNullableKeys<T> = {
    [P in keyof T]-? :  Exclude<T[P], null | undefined> extends never ? never: P
}[keyof T]
export type ExtractNonNullable<T> = {
    [P in NonNullableKeys<T>]: NonNullable<T[P]>
}

