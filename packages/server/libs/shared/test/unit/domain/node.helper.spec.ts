import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { Node } from '@shared/domain/user-file/node.entity'
import { FILE_STATE_DX, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { expect } from 'chai'

describe('NodeHelper', () => {
  const nodeHelper = new NodeHelper()

  describe('getWarningsForUnclosedFiles', () => {
    it('should return null if all files are closed', () => {
      const files: Node[] = [
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.CLOSED, name: 'file1' } as Node,
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.CLOSED, name: 'file2' } as Node,
      ]
      const result = nodeHelper.getWarningsForUnclosedFiles(files)
      expect(result).to.be.null
    })

    it('should return warning message if there are unclosed files', () => {
      const files: Node[] = [
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.CLOSED, name: 'file1' } as Node,
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.OPEN, name: 'file2' } as Node,
      ]
      const result = nodeHelper.getWarningsForUnclosedFiles(files)
      expect(result).to.eq(
        "Warning: The following files couldn't be attached in the download: 'file2'.",
      )
    })
  })

  describe('sanitizeNodeNames', () => {
    it('should sanitize the names of the nodes', () => {
      const nodes: Node[] = [
        { name: 'aaa/bbb/ccc.txt' } as Node,
        { name: 'ヽ༼ຈل͜ຈ༽ﾉ' } as Node,
        { name: '(•_•)' } as Node,
        { name: '( •_•)>⌐■-■' } as Node,
        { name: '(⌐■_■)' } as Node,
      ]
      const result = nodeHelper.sanitizeNodeNames(nodes)
      expect(result).to.deep.eq([
        { name: 'aaabbbccc.txt' } as Node,
        { name: 'ヽ༼ຈل͜ຈ༽ﾉ' } as Node,
        { name: '(•_•)' } as Node,
        { name: '( •_•)⌐■-■' } as Node,
        { name: '(⌐■_■)' } as Node,
      ])
    })
  })

  describe('renameDuplicateFiles', () => {
    it('should rename duplicate files in the same folder', () => {
      const nodes: Node[] = [
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: null } as Node,
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: null } as Node,
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: null } as Node,
        { name: 'folder', stiType: FILE_STI_TYPE.FOLDER, parentFolder: null, id: 1 } as Node,
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: { id: 1 } } as Node,
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: { id: 1 } } as Node,
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: { id: 1 } } as Node,
      ]
      const result = nodeHelper.renameDuplicateFiles(nodes)
      expect(result).to.deep.eq([
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: null } as Node,
        { name: 'file 1.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: null } as Node,
        { name: 'file 2.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: null } as Node,
        { name: 'folder', stiType: FILE_STI_TYPE.FOLDER, parentFolder: null, id: 1 } as Node,
        { name: 'file.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: { id: 1 } } as Node,
        { name: 'file 1.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: { id: 1 } } as Node,
        { name: 'file 2.txt', stiType: FILE_STI_TYPE.USERFILE, parentFolder: { id: 1 } } as Node,
      ])
    })
  })
})
