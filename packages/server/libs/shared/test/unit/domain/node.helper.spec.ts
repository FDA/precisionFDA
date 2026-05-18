import { expect } from 'chai'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX, FILE_STI_TYPE, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'

describe('NodeHelper', () => {
  const nodeHelper = new NodeHelper(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  )

  describe('getWarningsForUnclosedFiles', () => {
    it('should return null if all files are closed', () => {
      const files: Node[] = [
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.CLOSED, name: 'file1' } as Node,
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.CLOSED, name: 'file2' } as Node,
      ]
      const result = nodeHelper.getWarningsForUnclosedFiles(files)
      expect(result).to.be.null()
    })

    it('should return warning message if there are unclosed files', () => {
      const files: Node[] = [
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.CLOSED, name: 'file1' } as Node,
        { stiType: FILE_STI_TYPE.USERFILE, state: FILE_STATE_DX.OPEN, name: 'file2' } as Node,
      ]
      const result = nodeHelper.getWarningsForUnclosedFiles(files)
      expect(result).to.eq("Warning: The following files couldn't be attached in the download: 'file2'.")
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
      const result = nodeHelper.sanitizeNodeNames(nodes as never)
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
      const result = nodeHelper.renameDuplicateFiles(nodes as never)
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

  describe('resolveOrigin', () => {
    it('returns Uploaded origin for user parent type', async () => {
      const helper = new NodeHelper(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { findOne: async () => null } as never,
        { findOne: async () => null } as never,
      )

      const result = await helper.resolveOrigin({ parentType: PARENT_TYPE.USER } as UserFile)

      expect(result).to.deep.equal({
        origin: 'Uploaded',
        parentType: 'User',
        parentUid: null,
      })
    })

    it('returns Copied origin for node parent type without parentId', async () => {
      const helper = new NodeHelper(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { findOne: async () => null } as never,
        { findOne: async () => null } as never,
      )

      const result = await helper.resolveOrigin({ parentType: PARENT_TYPE.NODE, parentId: null } as UserFile)

      expect(result).to.deep.equal({
        origin: 'Copied',
        parentType: 'Node',
        parentUid: null,
      })
    })

    it('renders job origin link when parent job exists', async () => {
      let findOneWhere: { id: number } | null = null
      const jobRepo = {
        findOne: async (where: { id: number }) => {
          findOneWhere = where
          return { uid: 'job-123', name: 'Job Name' }
        },
      }

      const helper = new NodeHelper(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        jobRepo as never,
        { findOne: async () => null } as never,
      )

      const result = await helper.resolveOrigin({ parentType: PARENT_TYPE.JOB, parentId: 42 } as UserFile)

      expect(findOneWhere).to.deep.equal({ id: 42 })
      expect(result).to.deep.equal({
        origin: { text: 'Job Name', href: '/jobs/job-123' },
        parentType: 'Job',
        parentUid: 'job-123',
      })
    })

    it('returns fallback when parent job does not exist', async () => {
      let findOneWhere: { id: number } | null = null
      const jobRepo = {
        findOne: async (where: { id: number }) => {
          findOneWhere = where
          return null
        },
      }

      const helper = new NodeHelper(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        jobRepo as never,
        { findOne: async () => null } as never,
      )

      const result = await helper.resolveOrigin({ parentType: PARENT_TYPE.JOB, parentId: 77 } as UserFile)

      expect(findOneWhere).to.deep.equal({ id: 77 })
      expect(result).to.deep.equal({
        origin: null,
        parentType: PARENT_TYPE.JOB,
        parentUid: null,
      })
    })

    it('renders comparison origin link when parent comparison exists', async () => {
      let findOneWhere: { id: number } | null = null
      const comparisonRepo = {
        findOne: async (where: { id: number }) => {
          findOneWhere = where
          return { id: 55, name: 'Comparison Name' }
        },
      }

      const helper = new NodeHelper(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { findOne: async () => null } as never,
        comparisonRepo as never,
      )

      const result = await helper.resolveOrigin({ parentType: PARENT_TYPE.COMPARISON, parentId: 55 } as UserFile)

      expect(findOneWhere).to.deep.equal({ id: 55 })
      expect(result).to.deep.equal({
        origin: { text: 'Comparison Name', href: '/comparisons/55' },
        parentType: 'Comparison',
        parentUid: '55',
      })
    })

    it('returns fallback for unknown parent type', async () => {
      const helper = new NodeHelper(
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { findOne: async () => null } as never,
        { findOne: async () => null } as never,
      )

      const result = await helper.resolveOrigin({ parentType: 'UnknownType', parentId: 5 } as unknown as UserFile)

      expect(result).to.deep.equal({
        origin: null,
        parentType: 'UnknownType',
        parentUid: null,
      })
    })
  })
})
