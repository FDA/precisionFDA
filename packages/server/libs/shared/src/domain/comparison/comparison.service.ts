import { Injectable, Logger } from '@nestjs/common'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { InvalidStateError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Comparison } from './comparison.entity'

@Injectable()
export class ComparisonService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly comparisonRepository: ComparisonRepository) {}

  getEditableEntityById(id: number): Promise<Comparison | null> {
    return this.comparisonRepository.findEditableOne({ id })
  }

  getAccessibleEntityById(id: number): Promise<Comparison | null> {
    return this.comparisonRepository.findAccessibleOne({ id })
  }

  async validateComparisons(fileToRemove: UserFile): Promise<void> {
    this.logger.log(`Validating comparisons for file ${fileToRemove.name}`)
    const result = await this.comparisonRepository.findComparisonsByUserFile(fileToRemove)
    if (result && result.length > 0) {
      throw new InvalidStateError(
        `File ${fileToRemove.name} cannot be deleted because it participates` +
          ' in one or more comparisons. Please delete all the comparisons first.',
      )
    }
  }
}
