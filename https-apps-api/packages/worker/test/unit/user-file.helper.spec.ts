import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { User } from '@pfda/https-apps-shared/src/domain'
import { userFile, database } from '@pfda/https-apps-shared'
import { create, db } from '@pfda/https-apps-shared/src/utils/test'

describe('user-file.helper', () => {
  context('parseFoldersFromClient()', () => {
    it('should return folders structure - filtered and sorted', () => {
      const input = ['/', '/platform-folder', '/.Notebook_snapshots', '/platform-folder/subfolder']
      const result = userFile.helper.parseFoldersFromClient(input)
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
      const result = userFile.helper.parseFoldersFromClient(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/foo-renamed', '/foo-renamed/bar'])
    })

    it('puts longer strings after shorter strings', () => {
      const input = ['/', '/a/b/c', '/a/b']
      const result = userFile.helper.parseFoldersFromClient(input)
      expect(result).to.be.an('array').with.lengthOf(2)
      expect(result).to.have.ordered.members(['/a/b', '/a/b/c'])
    })
  })

  context('parseFoldersFromDatabase()', () => {
    let em: EntityManager<MySqlDriver>
    let user: User

    beforeEach(async () => {
      await db.dropData(database.connection())
      em = database.orm().em
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
        { user },
        {
          parentFolderId: parentFolder.id,
          name: 'sub-folder',
        },
      )
      const subfolder2 = create.filesHelper.createFolder(
        em,
        { user },
        {
          parentFolderId: parentFolder.id,
          name: 'sub-folder2',
        },
      )
      await em.flush()
      const result = userFile.helper.parseFoldersFromDatabase([subfolder, parentFolder, subfolder2])
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
        { user },
        {
          parentFolderId: parentFolder.id,
          name: 'sub-folder',
        },
      )
      await em.flush()
      const subfolder2 = create.filesHelper.createFolder(
        em,
        { user },
        {
          parentFolderId: subfolder.id,
          name: 'sub-folder2',
        },
      )
      await em.flush()
      const result = userFile.helper.parseFoldersFromDatabase([subfolder, parentFolder, subfolder2])
      expect(result).to.be.an('array').with.lengthOf(3)
      expect(result).to.have.ordered.members([
        '/parent-folder',
        '/parent-folder/sub-folder',
        '/parent-folder/sub-folder/sub-folder2',
      ])
    })

    // todo: test alphabetical order
  })
})
