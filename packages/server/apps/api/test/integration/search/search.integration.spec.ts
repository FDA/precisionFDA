import type { EntityManager, SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { ExpertMeta } from '@shared/domain/expert/entity/expert.entity'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import supertest from 'supertest'
import { testedApp } from '../../index'

describe('Search Controller', () => {
  let em: SqlEntityManager

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
  })

  it('should return 400 for unknown entity type', async () => {
    await supertest(testedApp.getHttpServer())
      .get('/search')
      .query({ query: 'test', entityType: 'unknown' })
      .expect(400)
  })

  it('should return 400 for missing query', async () => {
    await supertest(testedApp.getHttpServer())
      .get('/search')
      .query({ entityType: 'challenge' })
      .expect(400)
  })

  it('should return 400 for missing entity type', async () => {
    await supertest(testedApp.getHttpServer())
      .get('/search')
      .query({ query: 'important' })
      .expect(400)
  })

  it('should return empty result if no matching entities found', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get('/search')
      .query({ query: 'important', entityType: 'challenge' })
      .expect(200)

    expect(body).to.be.an('array')
    expect(body).to.have.length(0)
  })

  describe('challenge search', () => {
    const CHALLENGE_NAME = 'Super important thing'
    const CHALLENGE_DESCRIPTION = 'Some description'

    beforeEach(async () => {
      create.challengeHelper.create(em, {
        name: 'Foo bar baz',
        status: CHALLENGE_STATUS.OPEN,
      })
      create.challengeHelper.create(em, {
        name: CHALLENGE_NAME,
        description: CHALLENGE_DESCRIPTION,
        status: CHALLENGE_STATUS.OPEN,
      })

      await em.flush()
    })

    it('should return search results for challenges', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/search')
        .query({ query: 'important', entityType: 'challenge' })
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(1)
      expect(body[0]).to.have.property('title', CHALLENGE_NAME)
      expect(body[0]).to.have.property('description', CHALLENGE_DESCRIPTION)
    })
  })

  describe('expert search', () => {
    const EXPERT_USER_FIRST_NAME = 'firstname'
    const EXPERT_USER_LAST_NAME = 'lastname'
    const EXPERT_META_BLOG = 'super important blog'

    beforeEach(async () => {
      const user = create.userHelper.create(em, {
        firstName: EXPERT_USER_FIRST_NAME,
        lastName: EXPERT_USER_LAST_NAME,
      })
      const user2 = create.userHelper.create(em, {
        firstName: EXPERT_USER_FIRST_NAME,
        lastName: EXPERT_USER_LAST_NAME,
      })

      create.expertHelper.create(
        em,
        { user },
        {
          meta: { _blog: EXPERT_META_BLOG } as ExpertMeta,
        },
      )
      create.expertHelper.create(
        em,
        { user: user2 },
        {
          meta: { _blog: 'some other blog' } as ExpertMeta,
        },
      )

      await em.flush()
    })

    it('should return search results for challenges', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/search')
        .query({ query: 'important', entityType: 'expert' })
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(1)
      expect(body[0]).to.have.property('title', 'firstname lastname')
      expect(body[0]).to.have.property('description', EXPERT_META_BLOG)
    })
  })

  describe('expert question search', () => {
    const EXPERT_QUESTION_BODY = 'super important body'
    const EXPERT_USER_FIRST_NAME = 'firstname'
    const EXPERT_USER_LAST_NAME = 'lastname'

    beforeEach(async () => {
      const expertUser1 = create.userHelper.create(em, {
        firstName: EXPERT_USER_FIRST_NAME,
        lastName: EXPERT_USER_LAST_NAME,
      })
      const expertUser2 = create.userHelper.create(em)

      const askingUser1 = create.userHelper.create(em)
      const askingUser2 = create.userHelper.create(em)

      const expert1 = create.expertHelper.create(em, { user: expertUser1 })
      const expert2 = create.expertHelper.create(em, { user: expertUser2 })

      create.expertQuestionHelper.create(
        em,
        { expert: expert1, user: askingUser1 },
        { body: EXPERT_QUESTION_BODY },
      )
      create.expertQuestionHelper.create(
        em,
        { expert: expert2, user: askingUser2 },
        { body: 'some other body' },
      )

      await em.flush()
    })

    it('should return search results for expert questions', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/search')
        .query({ query: 'important', entityType: 'expertQuestion' })
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(1)
      expect(body[0]).to.have.property('title', 'firstname lastname')
      expect(body[0]).to.have.property('description', EXPERT_QUESTION_BODY)
    })
  })
})
