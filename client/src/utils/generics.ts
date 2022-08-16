export type GetObjValues<T> = T extends Record<any, infer V> ? V : never

// type GetObjectAsAst<ObjT> = 

export type FlipKeysAndValues<
  ObjT extends Record<string | symbol | number, string | symbol | number>,
  Ast extends Record<string, {
    key: keyof ObjT
    value: any
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
    value: any
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

// TODO(samuel) write unit-tests

export type MapValuesByFn<
  T,
  MapperT extends (arg: any) => any,
  Result = {
    [key in keyof T]: T[key] extends Parameters<MapperT>[0] ? ReturnType<MapperT> : unknown
  }
> = Result

// ┌───────────────────────────────┐
// │                               │
// │   Unit test "MapValuesByFn"   │
// │                               │
// └───────────────────────────────┘

// const x = {
//   a: 5,
//   b: 7,
//   c: 12,
// } as const

// const mapper = (x: number) => x.toString()

// type TestMapValuesByFn = MapValuesByFn<typeof x, typeof mapper>

export type KeysOfUnion<T> = T extends T ? keyof T: never;

// TODO(samuel) this works only with strict null check compiler option
// TODO(samuel) add to docs
export type NonNullableKeys<T> = {
    [P in keyof T]-? :  Exclude<T[P], null | undefined> extends never ? never: P
}[keyof T]
export type ExtractNonNullable<T> = {
    [P in NonNullableKeys<T>]: NonNullable<T[P]>
}

// ┌─────────────────────────────────┐
// │                                 │
// │   Unit test "NonNullableKeys"   │
// │                                 │
// └─────────────────────────────────┘

// const x = {
//   a: true ,
//   b: null
// } as const

// type A = typeof x
// type B = NonNullableKeys<A>

