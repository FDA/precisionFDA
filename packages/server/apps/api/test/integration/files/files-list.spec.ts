import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { FileGetDTO } from '@shared/domain/user-file/dto/file-get.dto'
import { FolderDTO } from '@shared/domain/user-file/dto/folder.dto'
import { FILE_STATE_DX, FILE_STATE_PFDA, FILE_STI_TYPE, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { create, db } from '@shared/test'
import { testedApp } from '../..'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('GET /files', () => {
  let em: SqlEntityManager
  let user: User
  let space: Space
  let challengeBot: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as SqlEntityManager
    em.clear()
    user = create.userHelper.create(em)
    challengeBot = create.userHelper.createChallengeBot(em)
    create.sessionHelper.create(em, { user })
    space = create.spacesHelper.create(em, {})
    create.spacesHelper.addMember(
      em,
      { space, user },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      { space, user: challengeBot },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    await em.flush()
  })

  it('fetch returns empty array if no files are accessible for the user', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(0)
  })

  it('fetches accessible files with pagination if scope is not provided', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: 'private' })
    create.filesHelper.create(em, { user }, { name: 'file2.txt', scope: 'public' })
    create.filesHelper.create(em, { user }, { name: 'file3.txt', scope: space.scope })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(3)
  })

  it('fetch accessible files with challenge bot filter', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: 'private' })
    create.filesHelper.create(em, { user: challengeBot }, { name: 'file2.txt', scope: space.scope })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get('/files')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0].name).to.equal('file1.txt')

    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get('/files?ignoreChallengeBot=true')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(1)
    expect(body2.data[0].name).to.equal('file1.txt')

    const { body: body3 } = await supertest(testedApp.getHttpServer())
      .get('/files?ignoreChallengeBot=false')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body3.data.length).to.equal(2)
    const names = body3.data.map((item: FileGetDTO | FolderDTO) => item.name)
    expect(names).to.include.members(['file1.txt', 'file2.txt'])
  })

  it('fetch accessible files with comparison filter', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: 'private' })
    create.filesHelper.create(em, { user }, { name: 'file2.txt', scope: 'private', parentType: PARENT_TYPE.COMPARISON })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get('/files')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0].name).to.equal('file1.txt')

    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get('/files?ignoreComparison=true')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(1)
    expect(body2.data[0].name).to.equal('file1.txt')

    const { body: body3 } = await supertest(testedApp.getHttpServer())
      .get('/files?ignoreComparison=false')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body3.data.length).to.equal(2)
    const names = body3.data.map((item: FileGetDTO | FolderDTO) => item.name)
    expect(names).to.include.members(['file1.txt', 'file2.txt'])
  })

  it('fetches accessible files with pagination for a specific scope', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: 'private' })
    create.filesHelper.create(em, { user }, { name: 'file2.txt', scope: 'public' })
    create.filesHelper.create(em, { user }, { name: 'file3.txt', scope: space.scope })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0].name).to.equal('file1.txt')

    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=public`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(1)
    expect(body2.data[0].name).to.equal('file2.txt')

    const { body: body3 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=${space.scope}`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body3.data.length).to.equal(1)
    expect(body3.data[0].name).to.equal('file3.txt')

    const { body: body4 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=nonexistent`)
      .set(getDefaultHeaderData(user))
      .expect(400)

    expect(body4.error.message).to.equal(
      'Scope must be one of: "private", "public", "space-{number}" (where {number} is an integer).',
    )
  })

  it('fetch and sort files by created time', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: 'private', createdAt: new Date('2023-01-01') })
    create.filesHelper.create(em, { user }, { name: 'file2.txt', scope: 'private', createdAt: new Date('2023-01-02') })
    create.filesHelper.create(em, { user }, { name: 'file3.txt', scope: 'private', createdAt: new Date('2023-01-03') })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&sort[createdAt]=ASC`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(3)
    expect(body.data[0].name).to.equal('file1.txt')
    expect(body.data[1].name).to.equal('file2.txt')
    expect(body.data[2].name).to.equal('file3.txt')

    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get('/files?scope=private')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(3)
    expect(body2.data[0].name).to.equal('file3.txt')
    expect(body2.data[1].name).to.equal('file2.txt')
    expect(body2.data[2].name).to.equal('file1.txt')
  })

  it('fetch files by combination of folderId and scope', async () => {
    const folder1 = create.filesHelper.create(em, { user }, { name: 'folder1', scope: 'private', isFolder: true })
    const folder2 = create.filesHelper.create(em, { user }, { name: 'folder2', scope: space.scope, isFolder: true })
    create.filesHelper.create(
      em,
      { user },
      { name: 'file1.txt', scope: 'private', parentFolder: folder1, parentFolderId: folder1.id },
    )
    create.filesHelper.create(
      em,
      { user },
      { name: 'file2.txt', scope: space.scope, scopedParentFolder: folder2, scopedParentFolderId: folder2.id },
    )
    create.filesHelper.create(em, { user }, { name: 'file3.txt', scope: space.scope })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&folderId=${folder1.id}`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0].name).to.equal('file1.txt')

    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=${space.scope}&folderId=${folder2.id}`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(1)
    expect(body2.data[0].name).to.equal('file2.txt')

    const { body: body3 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=${space.scope}&folderId=${folder1.id}`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body3.data.length).to.equal(0)

    const { body: body4 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&folderId=invalid`)
      .set(getDefaultHeaderData(user))
      .expect(400)

    expect(body4.error.message).to.equal('folderId must be a number conforming to the specified constraints')
  })

  it('fetch files by combination of uid, scope and folderId', async () => {
    const folder = create.filesHelper.create(em, { user }, { name: 'folder1', scope: 'private', isFolder: true })
    const file1 = create.filesHelper.create(
      em,
      { user },
      { name: 'file1.txt', scope: 'private', parentFolder: folder, parentFolderId: folder.id },
    )
    const file2 = create.filesHelper.create(em, { user }, { name: 'file2.txt', scope: 'private' })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?uids=${file1.uid}&uids=${file2.uid}&scope=private&folderId=${folder.id}`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0].name).to.equal('file1.txt')
  })

  it('fetch files and folders by scope and parent folder', async () => {
    const parentFolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'parentFolder', scope: 'private', isFolder: true },
    )
    create.filesHelper.createFolder(
      em,
      { user },
      { name: 'childFolder', scope: 'private', parentFolder, parentFolderId: parentFolder.id, isFolder: true },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user },
      { name: 'file1.txt', scope: 'private', parentFolder, parentFolderId: parentFolder.id },
    )
    create.filesHelper.create(em, { user }, { name: 'file2.txt', scope: 'private' })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&folderId=${parentFolder.id}&type=UserFile&type=Folder`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(2)
    const files = body.data.filter((item: FileGetDTO | FolderDTO) => item.stiType === FILE_STI_TYPE.USERFILE)
    const folders = body.data.filter((item: FileGetDTO | FolderDTO) => item.stiType === FILE_STI_TYPE.FOLDER)
    expect(files.length).to.equal(1)
    expect(folders.length).to.equal(1)
    expect(files[0].name).to.equal('file1.txt')
    expect(folders[0].name).to.equal('childFolder')
  })

  it('fetch files with size filters', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1name.txt', scope: 'private', fileSize: 100 })
    create.filesHelper.create(em, { user }, { name: 'file2name.txt', scope: 'private', fileSize: 200 })
    create.filesHelper.create(em, { user }, { name: 'file3name.txt', scope: 'private', fileSize: 300 })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=name&filter[size]=150,250`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body).to.have.property('data').that.is.an('array').with.lengthOf(1)
    expect(body.data[0]).to.have.property('name', 'file2name.txt')

    const { body: body1 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=name&filter[size]=150,`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body1).to.have.property('data').that.is.an('array').with.lengthOf(2)
    const names1 = body1.data.map(node => node.name)
    expect(names1.includes('file2name.txt')).to.be.true()
    expect(names1.includes('file3name.txt')).to.be.true()

    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=name&filter[size]=,250`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2).to.have.property('data').that.is.an('array').with.lengthOf(2)
    const names2 = body2.data.map(node => node.name)
    expect(names2.includes('file2name.txt')).to.be.true()
    expect(names2.includes('file1name.txt')).to.be.true()
  })

  it('fetch files state filters and always ignore "removing" files', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1name.txt', scope: 'private', state: FILE_STATE_DX.CLOSED })
    create.filesHelper.create(em, { user }, { name: 'file2name.txt', scope: 'private', state: FILE_STATE_DX.CLOSING })
    create.filesHelper.create(em, { user }, { name: 'file3name.txt', scope: 'private', state: FILE_STATE_DX.OPEN })
    create.filesHelper.create(
      em,
      { user },
      { name: 'file3name.txt', scope: 'private', state: FILE_STATE_PFDA.REMOVING },
    )
    create.filesHelper.create(
      em,
      { user },
      { name: 'folder1', scope: 'private', state: FILE_STATE_PFDA.REMOVING, isFolder: true },
    )
    await em.flush()

    const { body: body1 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body1).to.have.property('data').that.is.an('array').with.lengthOf(3)
    expect(body1.data.map(node => node.state).includes(FILE_STATE_PFDA.REMOVING)).to.be.false()

    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[states]=${FILE_STATE_DX.OPEN}`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2).to.have.property('data').that.is.an('array').with.lengthOf(1)
    expect(body2.data[0]).to.have.property('name', 'file3name.txt')
  })

  it('fetch files with addedBy filter', async () => {
    const otherUser = create.userHelper.create(em, { firstName: 'Jane', lastName: 'Doe' })
    create.sessionHelper.create(em, { user: otherUser })
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: 'public' })
    create.filesHelper.create(em, { user: otherUser }, { name: 'file2.txt', scope: 'public' })
    await em.flush()

    // matches by full name
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=public&filter[addedBy]=Jane Doe`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0].name).to.equal('file2.txt')

    // matches by partial first name
    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=public&filter[addedBy]=Jane`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(1)
    expect(body2.data[0].name).to.equal('file2.txt')

    // matches by reversed name order (last name first)
    const { body: body3 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=public&filter[addedBy]=Doe Jane`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body3.data.length).to.equal(1)
    expect(body3.data[0].name).to.equal('file2.txt')

    // no match
    const { body: body4 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=public&filter[addedBy]=NonExistent`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body4.data.length).to.equal(0)

    await supertest(testedApp.getHttpServer())
      .get(`/files?scope=public&filter[addedBy]=`)
      .set(getDefaultHeaderData(user))
      .expect(400)
  })

  it('fetch files with location filter', async () => {
    const spaceAlpha = create.spacesHelper.create(em, { name: 'Alpha Project' })
    const spaceBeta = create.spacesHelper.create(em, { name: 'Beta Project' })
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { space: spaceAlpha, user },
      {
        role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    create.spacesHelper.addMember(
      em,
      { space: spaceBeta, user },
      {
        role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: spaceAlpha.scope })
    create.filesHelper.create(em, { user }, { name: 'file2.txt', scope: spaceBeta.scope })
    await em.flush()

    // matches only files in spaces whose name contains "Alpha"
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=spaces&filter[location]=Alpha`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0].name).to.equal('file1.txt')

    // case-insensitive match
    const { body: body1 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=spaces&filter[location]=alpha`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body1.data.length).to.equal(1)
    expect(body1.data[0].name).to.equal('file1.txt')

    // matches files in all spaces when filter matches both
    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=spaces&filter[location]=Project`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(2)

    // no match
    const { body: body3 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=spaces&filter[location]=NonExistent`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body3.data.length).to.equal(0)

    await supertest(testedApp.getHttpServer())
      .get(`/files?scope=spaces&filter[location]=`)
      .set(getDefaultHeaderData(user))
      .expect(400)
  })

  it('fetch files with name filter', async () => {
    create.filesHelper.create(em, { user }, { name: 'report_2024.txt', scope: 'private' })
    create.filesHelper.create(em, { user }, { name: 'report_2025.txt', scope: 'private' })
    create.filesHelper.create(em, { user }, { name: 'summary\\.txt', scope: 'private' })
    await em.flush()

    // matches by partial name
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=report`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(2)
    const names = body.data.map((item: FileGetDTO) => item.name)
    expect(names).to.include.members(['report_2024.txt', 'report_2025.txt'])

    // underscore treated as a literal character, not a SQL wildcard
    const { body: body2 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=report_2024`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body2.data.length).to.equal(1)
    expect(body2.data[0].name).to.equal('report_2024.txt')

    const { body: body3 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=\\`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body3.data.length).to.equal(1)
    expect(body3.data[0].name).to.equal('summary\\.txt')

    // no match
    const { body: body4 } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=nonexistent`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body4.data.length).to.equal(0)

    await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&filter[name]=`)
      .set(getDefaultHeaderData(user))
      .expect(400)
  })

  it('fetch files and populate necessary fields for the frontend', async () => {
    create.filesHelper.create(em, { user }, { name: 'file1.txt', scope: 'private' })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&fields[properties]=true&fields[path]=true&fields[tags]=true&fields[license]=true`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(1)
    expect(body.data[0]).to.have.property('properties')
    expect(body.data[0]).to.have.property('folderPath')
    expect(body.data[0]).to.have.property('tags')
  })

  it('fetch files and path if path is requested and folderId is provided', async () => {
    const parentFolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'parentFolder', scope: 'private', isFolder: true },
    )
    const childFolder = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'childFolder', scope: 'private', parentFolder, parentFolderId: parentFolder.id, isFolder: true },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user },
      { name: 'file1.txt', scope: 'private', parentFolder: childFolder, parentFolderId: childFolder.id },
    )
    create.filesHelper.create(
      em,
      { user },
      { name: 'file2.txt', scope: 'private', parentFolder: childFolder, parentFolderId: childFolder.id },
    )
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=private&folderId=${childFolder.id}&fields[path]=true`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(2)
    expect(body.data[0]).to.have.property('folderPath')
    expect(body.data[0].folderPath).to.be.an('array')
    expect(body.data[0].folderPath[0]).to.have.property('name', 'parentFolder')
    expect(body.data[0].folderPath[1]).to.have.property('name', 'childFolder')
    expect(body.data[1]).to.have.property('folderPath')
    expect(body.data[1].folderPath).to.be.an('array')
    expect(body.data[1].folderPath[0]).to.have.property('name', 'parentFolder')
    expect(body.data[1].folderPath[1]).to.have.property('name', 'childFolder')
  })

  it('fetch files in spaces if scope is spaces', async () => {
    const space2 = create.spacesHelper.create(em, {})
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { space: space2, user },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.filesHelper.create(
      em,
      { user },
      { name: 'file1.txt', scope: space.scope, createdAt: new Date('2023-01-01') },
    )
    create.filesHelper.create(
      em,
      { user },
      { name: 'file2.txt', scope: space2.scope, createdAt: new Date('2023-01-02') },
    )
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/files?scope=spaces`)
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data.length).to.equal(2)
    expect(body.data[0].name).to.equal('file2.txt')
    expect(body.data[0].scope).to.equal(space2.scope)
    expect(body.data[1].name).to.equal('file1.txt')
    expect(body.data[1].scope).to.equal(space.scope)
  })
})
