import { Injectable, PipeTransform } from '@nestjs/common'
import { DXEntityType } from '@shared/domain/entity/domain/dxid'
import { Uid, UidAbleEntityType } from '@shared/domain/entity/domain/uid'
import { ValidationError } from '@shared/errors'
import { UidUtils } from '@shared/utils/uid.utils'

type UidValidationPipeOptions = {
  entityType?: DXEntityType
}

/**
 * Pipe that validates the UID parameter in a request.
 *
 * This pipe uses the UidUtils.isValidUId function to check if the UID parameter
 * conforms to the expected format. If the UID is invalid, a *ValidationError*
 * is thrown and the request is rejected.
 *
 * @example usage can be found in
 * DbClusterController#updateDbCluster
 *
 * @example with entity type
 * @Param('uid', new UidValidationPipe({ entityType: 'job' })) uid: Uid<'job'>
 */
@Injectable()
export class UidValidationPipe<T extends UidAbleEntityType = UidAbleEntityType> implements PipeTransform<string> {
  private readonly entityType?: T

  constructor(options?: UidValidationPipeOptions & { entityType?: T }) {
    this.entityType = options?.entityType
  }

  transform(value: string): Uid<T> {
    if (!UidUtils.isValidUId(value, this.entityType)) {
      const entityTypeSuffix = this.entityType ? ` for entity type "${this.entityType}"` : ''
      throw new ValidationError(`Invalid UID format: ${value}${entityTypeSuffix}`)
    }

    return value
  }
}
