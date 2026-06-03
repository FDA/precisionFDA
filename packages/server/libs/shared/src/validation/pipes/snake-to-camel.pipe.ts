import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
}

function transformKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(transformKeys)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [snakeToCamel(k), transformKeys(v)]),
    )
  }
  return value
}

@Injectable()
export class SnakeToCamelPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type === 'body') return transformKeys(value)
    return value
  }
}
