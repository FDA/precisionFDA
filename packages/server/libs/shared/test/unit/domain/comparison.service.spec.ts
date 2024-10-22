import { expect } from 'chai'
import { stub } from 'sinon'
import { ComparisonService } from '@shared/domain/comparison/comparison.service'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

describe('ComparisonService', () => {
  const findComparisonsByUserFileStub = stub()

  const createComparisonService = () => {
    const comparisonRepository = {
      findComparisonsByUserFile: findComparisonsByUserFileStub,
    } as unknown as ComparisonRepository

    return new ComparisonService(comparisonRepository)
  }

  beforeEach(() => {
    findComparisonsByUserFileStub.reset()
    findComparisonsByUserFileStub.throws()
  })

  describe('#validateComparisons', () => {
    it('validates successfully', async () => {
      const file = { name: 'file' } as UserFile
      findComparisonsByUserFileStub.withArgs(file).resolves([])
      const comparisonService = createComparisonService()

      await comparisonService.validateComparisons({ name: 'file' } as UserFile)

      expect(findComparisonsByUserFileStub.calledOnce).to.be.true
      expect(findComparisonsByUserFileStub.firstCall.args[0].name).to.equal('file')
    })

    it('validation error', async () => {
      const file = { name: 'file' } as UserFile
      findComparisonsByUserFileStub.withArgs(file).resolves([{ id: 1 }])

      const comparisonService = createComparisonService()
      await expect(
        comparisonService.validateComparisons({ name: 'file' } as UserFile),
      ).to.be.rejectedWith(
        Error,
        'File file cannot be deleted because it participates' +
          ' in one or more comparisons. Please delete all the comparisons first.',
      )
    })
  })
})
