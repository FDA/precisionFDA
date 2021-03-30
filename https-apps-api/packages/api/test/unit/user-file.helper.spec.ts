import { expect } from 'chai'
import { userFile } from '@pfda/https-apps-shared'

describe('user-file.helper', () => {
  context('filterLeafPaths()', () => {
    it('should return one leaf path from set of folderPaths', () => {
      const input = ['/a', '/a/b', '/a/b/c']
      const result = userFile.helper.filterLeafPaths(input)
      expect(result).to.be.an('array').with.lengthOf(1)
      expect(result).to.have.ordered.members(['/a/b/c'])
    })

    it('should return two leaf paths from set of folderPaths', () => {
      const input = ['/a', '/a/b/c', '/a/b/d']
      const result = userFile.helper.filterLeafPaths(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/a/b/c', '/a/b/d'])
    })

    it('should return two leaf paths from set of folderPaths (prone to substrings)', () => {
      const input = ['/a', '/a/b', '/a/b2']
      const result = userFile.helper.filterLeafPaths(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/a/b', '/a/b2'])
    })

    it('should return two leaf paths from set of folderPaths (prone to substrings)', () => {
      const input = ['/a', '/a/b', '/a/b/c', '/b']
      const result = userFile.helper.filterLeafPaths(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/a/b/c', '/b'])
    })

    it('should return two leaf paths from set of folderPaths (prone to repetitions)', () => {
      const input = ['/a', '/a/b', '/a/b/a', '/b', '/b/a']
      const result = userFile.helper.filterLeafPaths(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/a/b/a', '/b/a'])
    })
  })
})
