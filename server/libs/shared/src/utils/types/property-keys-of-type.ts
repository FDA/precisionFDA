export type PropertyKeysOfType<OBJ extends object, TYPE> = {
  [KEY in keyof OBJ]: OBJ[KEY] extends TYPE ? KEY : never
}[keyof OBJ]
