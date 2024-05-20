import { EntityManager } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Tag } from '@shared/domain/tag/tag.entity'
import { RemoveTaggingsOperation } from '@shared/domain/tagging/ops/remove-taggings'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import pino from 'pino'
import { expect } from 'chai'
import { create, db } from '../../../src/test'

/**
 * Two files and two tags connected through Tagging.
 * File1 has tags [aaa, bbb], File2 has tag [aaa].
 */
describe('remove taggings tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: UserCtx

  let file1: UserFile
  let file2: UserFile
  let aaaTag: Tag
  let bbbTag: Tag
  let tagging1: Tagging
  let tagging2: Tagging
  let tagging3: Tagging

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }

    file1 = create.filesHelper.create(em, { user }, { name: 'file1' })
    file2 = create.filesHelper.create(em, { user }, { name: 'file2' })

    aaaTag = create.tagsHelper.create(em, { name: 'aaa' })
    bbbTag = create.tagsHelper.create(em, { name: 'bbb' })

    tagging1 = create.tagsHelper.createTagging(em, { tag: bbbTag })
    tagging2 = create.tagsHelper.createTagging(em, { tag: aaaTag })
    tagging3 = create.tagsHelper.createTagging(em, { tag: aaaTag })

    file1.taggings.add(tagging1)
    file1.taggings.add(tagging2)
    file2.taggings.add(tagging3)

    await em.flush()
  })

  it('test remove tagging for file1', async () => {
    const op = new RemoveTaggingsOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute(file1.id)

    em.clear()

    const loadedAaaTag = await em.findOneOrFail(Tag, { id: aaaTag.id })
    expect(loadedAaaTag.taggingCount).to.equals(1)
    const loadedBbbTag = await em.findOne(Tag, { id: bbbTag.id })
    expect(loadedBbbTag).to.be.null()

    const loadedTagging1 = await em.findOne(Tagging, { id: tagging1.id })
    expect(loadedTagging1).to.be.null()
    const loadedTagging2 = await em.findOne(Tagging, { id: tagging2.id })
    expect(loadedTagging2).to.be.null()
    await em.findOneOrFail(Tagging, { id: tagging3.id })
  })

  it('test remove tagging for file2', async () => {
    const op = new RemoveTaggingsOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute(file2.id)

    const loadedAaaTag = await em.findOneOrFail(Tag, { id: aaaTag.id })
    expect(loadedAaaTag.taggingCount).to.equals(1)
    await em.findOneOrFail(Tag, { id: bbbTag.id })

    await em.findOneOrFail(Tagging, { id: tagging1.id })
    await em.findOneOrFail(Tagging, { id: tagging2.id })
    const loadedTagging3 = await em.findOneOrFail(Tagging, { id: tagging3.id })
    expect(loadedTagging3).to.be.null()
  })
})
