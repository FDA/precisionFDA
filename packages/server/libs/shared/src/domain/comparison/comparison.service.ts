import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'

@Injectable()
export class ComparisonService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly comparisonRepository: ComparisonRepository) {}

  async validateComparisons(fileToRemove: UserFile) {
    this.logger.log(`Validating comparisons for file ${fileToRemove.name}`)
    const result = await this.comparisonRepository.findComparisonsByUserFile(fileToRemove)
    if (result && result.length > 0) {
      throw new Error(
        `File ${fileToRemove.name} cannot be deleted because it participates` +
          ' in one or more comparisons. Please delete all the comparisons first.',
      )
    }
  }
}
