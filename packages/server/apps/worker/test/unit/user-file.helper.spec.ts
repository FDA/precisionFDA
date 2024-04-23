import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { create, db } from '@shared/test'
import {
  splitFolderPath,
  detectIntersectedTraverse,
  findFolderForPath, folderPathsFromFolders, parseFoldersFromClient,
} from '@shared/domain/user-file/user-file.helper'

describe('user-file.helper', () => {
  context('parseFoldersFromClient()', () => {
    it('should return folders structure - filtered and sorted', () => {
      const input = ['/', '/platform-folder', '/.Notebook_snapshots', '/platform-folder/subfolder']
      const result = parseFoldersFromClient(input)
      expect(result).to.be.an('array').with.lengthOf(3)
      expect(result).to.have.ordered.members([
        '/.Notebook_snapshots',
        '/platform-folder',
        '/platform-folder/subfolder',
      ])
    })

    it('should sort folders structure correctly', () => {
      // incorrect output discovered from the API
      // could break the folders sync
      const input = ['/', '/foo-renamed/bar', '/foo-renamed']
      const result = parseFoldersFromClient(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/foo-renamed', '/foo-renamed/bar'])
    })

    it('puts longer strings after shorter strings', () => {
      const input = ['/', '/a/b/c', '/a/b']
      const result = parseFoldersFromClient(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/a/b', '/a/b/c'])
    })
  })

  context('folderPathsFromFolders()', () => {
    let em: EntityManager<MySqlDriver>
    let user: User

    beforeEach(async () => {
      await db.dropData(database.connection())
      em = database.orm().em.fork()
      user = create.userHelper.create(em)
      await em.flush()
    })

    it('should return folder trees in strings', async () => {
      const parentFolder = create.filesHelper.createFolder(
        em,
        { user },
        {
          name: 'parent-folder',
        },
      )
      await em.flush()
      const subfolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder },
        {
          name: 'sub-folder',
        },
      )
      const subfolder2 = create.filesHelper.createFolder(
        em,
        { user, parentFolder },
        {
          name: 'sub-folder2',
        },
      )
      await em.flush()
      const result = folderPathsFromFolders([subfolder, parentFolder, subfolder2])
      expect(result).to.be.an('array').with.lengthOf(3)
      expect(result).to.have.ordered.members([
        '/parent-folder',
        '/parent-folder/sub-folder',
        '/parent-folder/sub-folder2',
      ])
    })

    it('should return folder trees in strings - 3 levels', async () => {
      const parentFolder = create.filesHelper.createFolder(
        em,
        { user },
        {
          name: 'parent-folder',
        },
      )
      await em.flush()
      const subfolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder },
        {
          name: 'sub-folder',
        },
      )
      await em.flush()
      const subfolder2 = create.filesHelper.createFolder(
        em,
        { user, parentFolder: subfolder },
        {
          name: 'sub-folder2',
        },
      )
      await em.flush()
      const result = folderPathsFromFolders([subfolder, parentFolder, subfolder2])
      expect(result).to.be.an('array').with.lengthOf(3)
      expect(result).to.have.ordered.members([
        '/parent-folder',
        '/parent-folder/sub-folder',
        '/parent-folder/sub-folder/sub-folder2',
      ])
    })

    // todo: test alphabetical order
  })

  context('findFolderForPath()', async () => {
    let em: EntityManager<MySqlDriver>
    let user: User

    beforeEach(async () => {
      await db.dropData(database.connection())
      em = database.orm().em.fork()
      user = create.userHelper.create(em)
      await em.flush()
    })

    it('should return correct Folder objects', async () => {
      // Create folder tree with the following paths
      const folderPaths = [
        '/foo',
        '/foo/bar',
        '/foo/bar/stu',
        '/parent-folder',
        '/parent-folder/sub-folder',
        '/parent-folder/sub-folder/sub-sub-folder',
        '/parent-folder/sub-folder2',
      ]

      const fooFolder = create.filesHelper.createFolder(em, { user }, { name: 'foo' })
      await em.flush()
      const barFolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder: fooFolder },
        { name: 'bar' },
      )
      await em.flush()
      const stuFolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder: barFolder },
        { name: 'stu' },
      )
      await em.flush()
      const parentFolder = create.filesHelper.createFolder(em, { user }, { name: 'parent-folder' })
      await em.flush()
      const subfolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder },
        { name: 'sub-folder' },
      )
      await em.flush()
      const subsubfolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder: subfolder },
        { name: 'sub-sub-folder' },
      )
      const subfolder2 = create.filesHelper.createFolder(
        em,
        { user, parentFolder },
        { name: 'sub-folder2' },
      )
      await em.flush()

      const folders = [
        fooFolder,
        barFolder,
        stuFolder,
        parentFolder,
        subfolder,
        subsubfolder,
        subfolder2,
      ]

      folderPaths.forEach((folderPath: string) => {
        const folderPathComponents = splitFolderPath(folderPath)
        const result = findFolderForPath(folders, folderPathComponents, undefined)
        expect(result.name).to.be.equal(folderPathComponents.pop())
      })

      let folderPathComponents = splitFolderPath('/parent-folder/sub-folder/sub-sub-folder')
      let result = findFolderForPath(folders, folderPathComponents, undefined)
      expect(result.name).to.be.equal('sub-sub-folder')
      expect(result.parentFolder.id).to.be.equal(subfolder.id)

      folderPathComponents = splitFolderPath('/foo/bar/stu')
      result = findFolderForPath(folders, folderPathComponents, undefined)
      expect(result.name).to.be.equal('stu')
      expect(result.parentFolder.id).to.be.equal(barFolder.id)
    })
  })

  context('detectIntersectedTraverse()', async () => {
    let em: EntityManager<MySqlDriver>
    let user: User

    beforeEach(async () => {
      await db.dropData(database.connection())
      em = database.orm().em.fork()
      user = create.userHelper.create(em)
      await em.flush()
    })

    it('should return a list of existing folders to keep', async () => {
      const parentFolder = create.filesHelper.createFolder(em, { user }, { name: 'parent-folder' })
      await em.flush()
      const subfolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder },
        { name: 'sub-folder' },
      )
      await em.flush()
      const subsubfolder = create.filesHelper.createFolder(
        em,
        { user, parentFolder: subfolder },
        { name: 'sub-sub-folder' },
      )
      const subfolder2 = create.filesHelper.createFolder(
        em,
        { user, parentFolder },
        { name: 'sub-folder2' },
      )
      await em.flush()

      const folders = [parentFolder, subfolder, subsubfolder]
      let folderPaths = splitFolderPath('/parent-folder')
      let result = detectIntersectedTraverse(folders, folderPaths, undefined, 0, [])
      expect(result).to.be.an('array').with.lengthOf(1)

      folderPaths = splitFolderPath('/parent-folder/sub-folder')
      result = detectIntersectedTraverse(folders, folderPaths, undefined, 0, [])
      expect(result).to.be.an('array').with.lengthOf(2)

      folderPaths = splitFolderPath('/parent-folder/sub-folder/sub-sub-folder')
      result = detectIntersectedTraverse(folders, folderPaths, undefined, 0, [])
      expect(result).to.be.an('array').with.lengthOf(3)
    })

    it('should work even with many folders', async () => {
      const folders: Folder[] = []
      const n = 32
      for (let i = 0; i < n; i++) {
        const folder = create.filesHelper.createFolder(em, { user }, { name: `folder-${i}` })
        folders.push(folder)
      }
      const folderPaths = folders.map(folder => folder.name)
      expect(folderPaths).to.be.an('array').with.lengthOf(n)
    })
  })
})
