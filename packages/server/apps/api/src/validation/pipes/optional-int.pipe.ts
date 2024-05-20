import { ArgumentMetadata, Injectable, BadRequestException } from '@nestjs/common'
import { ParseIntPipe } from '@nestjs/common'

@Injectable()
export class OptionalParseIntPipe extends ParseIntPipe {
  async transform(value: string, metadata: ArgumentMetadata): Promise<any> {
    if (Number.isNaN(value)) {
      return undefined
    }

    // Use the original ParseIntPipe's transform method for actual value parsing
    return super.transform(value, metadata).catch((e) => {
      throw new BadRequestException('Validation failed (numeric string is expected)')
    })
  }
}
