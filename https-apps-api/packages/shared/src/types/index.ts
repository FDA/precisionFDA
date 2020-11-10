/**
 * This file is used to export generic types.
 * It cannot be of the d.ts format because the build would then ignore it,
 * thus this workaround is in place.
 */

declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
}

declare type AnyObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [s: string]: any
}

export type { DeepPartial, AnyObject }
