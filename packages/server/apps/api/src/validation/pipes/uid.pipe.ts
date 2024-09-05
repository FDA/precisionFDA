import { PipeTransform, Injectable } from '@nestjs/common';
import { ValidationError } from '@shared/errors'
import { UidUtils } from '@shared/utils/uid.utils'

/**
 * Pipe that validates the UID parameter in a request.
 *
 * This pipe uses the UidUtils.isValidUId function to check if the UID parameter
 * conforms to the expected format. If the UID is invalid, a *ValidationError*
 * is thrown and the request is rejected.
 *
 * @example usage can be found in
 * DbClusterController#updateDbCluster
 */
@Injectable()
export class UidValidationPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!UidUtils.isValidUId(value)) {
      throw new ValidationError('Invalid UID format: ' + value)
    }

    return value
  }
}
