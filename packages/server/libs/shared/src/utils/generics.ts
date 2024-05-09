export type MapValuesToReturnType<
  T extends Record<string, (...args: any[]) => any | undefined>,
  // NOTE(samuel) although this field could be omitted
  // Typescript 4.7. heavily uses `infer` `extends` combo, this introduced change that can break chained generics
  // Implementing without this helper variable should result in error with mismatched keys
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#extends-constraints-on-infer-type-variables
  KeyT extends keyof T = keyof T,
  Result = {
    [key in KeyT]: ReturnType<T[key]>
  }
> = Result

// ┌───────────────────────────────────────┐
// │                                       │
// │   Unit test "MapValuesToReturnType"   │
// │                                       │
// └───────────────────────────────────────┘

// const mapValuesToReturnTypeSample1 = {
//   a: () => 1,
//   b: () => true,
// }
// const mapValuesToReturnTypeSample2 = {
//   a: () => 1,
//   b: () => true,
// } as const

// type TestMapValuesToReturnType1 = MapValuesToReturnType<typeof mapValuesToReturnTypeSample1>
// type TestMapValuesToReturnType2 = MapValuesToReturnType<typeof mapValuesToReturnTypeSample2>

export type MapValueObjectByKey<
  UpperKey extends string,
  T extends Record<string, any>,
  Default extends any = undefined,
  // NOTE(samuel) although this field could be omitted
  // Typescript 4.7. heavily uses `infer` `extends` combo, this introduced change that can break chained generics
  // Implementing without this helper variable should result in error with mismatched keys
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#extends-constraints-on-infer-type-variables
  KeyT extends keyof T = keyof T,
  Result = {
    [key in KeyT]: UpperKey extends keyof T[key] ? T[key][UpperKey] : Default
  },
> = Result

// ┌─────────────────────────────────────┐
// │                                     │
// │   Unit Test "MapValueObjectByKey"   │
// │                                     │
// └─────────────────────────────────────┘

// const mapValueObjectByKeySample1 = {
//   a: {
//     type: 'asdf',
//     lol: true,
//   },
//   b: {
//     type: 'qwer',
//   },
//   c: {
//     nada: 123,
//   },
//   d: {
//     type: 123,
//   },
//   e: {
//     type: {
//       nested: 'type'
//     },
//   },
//   f: {
//     type: [123,'456']
//   }
// }

// const mapValueObjectByKeySample2 = {
//   a: {
//     type: 'asdf',
//     lol: true,
//   },
//   b: {
//     type: 'qwer',
//   },
//   c: {
//     nada: 123,
//   },
//   d: {
//     type: 123,
//   },
//   e: {
//     type: {
//       nested: 'type'
//     },
//   },
//   f: {
//     type: [123,'456']
//   }
// } as const

// type TestMapValueObjectByKey1 = MapValueObjectByKey<'type', typeof mapValueObjectByKeySample1, 'DEFAULT'>
// type TestMapValueObjectByKey2 = MapValueObjectByKey<'type', typeof mapValueObjectByKeySample2, 'DEFAULT'>

// ┌─────────────────────────────────────┐
// │                                     │
// │  Unit test "MapTupleToReturnTypes"  │
// │                                     │
// └─────────────────────────────────────┘

// const mapTupleToReturnTypesSample1 = [() => 1, () => true, () => 'asdf']
// const mapTupleToReturnTypesSample2 = [() => 1, () => true, () => 'asdf'] as const
// type TestMapTupleToReturnTypes1 = MapTupleToReturnTypes<typeof mapTupleToReturnTypesSample1>
// type TestMapTupleToReturnTypes2 = MapTupleToReturnTypes<typeof mapTupleToReturnTypesSample2>


type ResolveSchemaArray<
  T,
  Result = T extends []
    ? []
    : T extends readonly [infer Head, ...infer Tail]
      ? Head extends (...args: any[]) => any
        ? [ReturnType<Head>, ...ResolveSchemaArray<Tail>]
        : [Head, ...ResolveSchemaArray<Tail>]
      : T extends Array<infer ArrayElementT>
        ? Array<
          | ReturnType<Extract<ArrayElementT, (...args: any[]) => any>>
          | ResolveSchemaReturnTypes<Exclude<ArrayElementT, (...args: any[]) => any>>
        >
        : never
> = Result

export type ResolveSchemaReturnTypes<
  T,
  Result = T extends (...args: any[]) => any
    ? ReturnType<T>
    : T extends any[]
      ? ResolveSchemaArray<T>
      : T extends {}
        ? {
          [key in keyof T]: ResolveSchemaReturnTypes<T[key]>
        }
        : T
> = Result

// ┌────────────────────────────────────────┐
// │                                        │
// │  Unit Test "ResolveSchemaReturnTypes"  │
// │                                        │
// └────────────────────────────────────────┘

// const testResolveSchemaReturnTypesSample1 = () => true
// const testResolveSchemaReturnTypesSample2 = {
//   key1: () => true,
//   key2: {
//     nested: 'object'
//   },
//   key3: [
//     'normal',
//     'array',
//     true
//   ],
//   key4: [
//     () => 'effects',
//     () => 'array'
//   ],
//   key5: [
//     'mixed',
//     () => 'array'
//   ],
//   key6: {
//     nested: () => 'object'
//   }
// }
// const testResolveSchemaReturnTypesSample3 = {
//   key1: () => true,
//   key2: {
//     nested: 'object'
//   },
//   key3: [
//     'normal',
//     'array',
//     true
//   ],
//   key4: [
//     () => 'effects' as const,
//     () => 'array' as const
//   ],
//   key5: [
//     'mixed',
//     () => 'array' as const
//   ],
//   key6: {
//     nested: () => 'object' as const
//   }
// } as const

// const testResolveSchemaReturnTypesAtomicValue1 = 6
// const testResolveSchemaReturnTypesAtomicValue2 = 'testString'
// type TestResolveSchemaReturnTypes1 = ResolveSchemaReturnTypes<typeof testResolveSchemaReturnTypesSample1>
// type TestResolveSchemaReturnTypes2 = ResolveSchemaReturnTypes<typeof testResolveSchemaReturnTypesSample2>
// type TestResolveSchemaReturnTypes3 = ResolveSchemaReturnTypes<typeof testResolveSchemaReturnTypesSample3>

// type TestResolveSchemaReturnTypes4 = ResolveSchemaReturnTypes<typeof testResolveSchemaReturnTypesAtomicValue1>
// type TestResolveSchemaReturnTypes5 = ResolveSchemaReturnTypes<typeof testResolveSchemaReturnTypesAtomicValue2>
