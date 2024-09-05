export class TypeUtils {
  static getPropertyValueFromUnknownObject<T>(obj: unknown, key: string): T | null {
    if (obj == null || typeof obj != 'object' || !(key in obj)) {
      return null
    }

    return (obj as { [K in typeof key]: T })[key]
  }
}
