import { Injectable, PipeTransform } from '@nestjs/common'
import { DXEntityType, DxId } from '@shared/domain/entity/domain/dxid'
import { PlatformEntityType } from '@shared/domain/entity/domain/platform.entity.type'
import { ValidationError } from '@shared/errors'
import { DxIdUtils } from '@shared/utils/dxid.utils'

type DxidValidationPipeOptions = {
  entityType?: DXEntityType | PlatformEntityType
}

/**
 * Pipe that validates the DxId parameter in a request.
 *
 * Uses DxIdUtils.isDxIdValid to check if the dxid parameter
 * conforms to the expected format. If invalid, a ValidationError
 * is thrown.
 *
 * @example
 * @Param('dxid', new DxidValidationPipe({ entityType: 'job' })) dxid: DxId<'job'>
 */
@Injectable()
export class DxidValidationPipe<T extends DXEntityType | PlatformEntityType = DXEntityType | PlatformEntityType>
  implements PipeTransform<string>
{
  private readonly entityType?: T

  constructor(options?: DxidValidationPipeOptions & { entityType?: T }) {
    this.entityType = options?.entityType
  }

  transform(value: string): DxId<T> {
    if (!DxIdUtils.isDxIdValid(value, this.entityType)) {
      const entityTypeSuffix = this.entityType ? ` for entity type "${this.entityType}"` : ''
      throw new ValidationError(`Invalid DxId format: ${value}${entityTypeSuffix}`)
    }

    return value as DxId<T>
  }
}
