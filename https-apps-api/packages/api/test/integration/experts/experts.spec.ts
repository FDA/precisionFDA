import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { database } from '@pfda/https-apps-shared'
import { Expert, User } from '@pfda/https-apps-shared/src/domain'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'
import { ExpertScope, ExpertState } from 'shared/src/domain/expert/expert.entity'

describe('/experts', () => {
  let em: EntityManager
  let user: User
  let experts: Expert[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()

    user = create.userHelper.create(em)
    // Createa a series of experts

    // 2023
    const date2023 = new Date(2023, 1)
    experts = []
    experts.push(create.expertHelper.create(em, { user }, { createdAt: date2023, updatedAt: date2023 }))
    experts.push(create.expertHelper.create(em, { user }, { createdAt: date2023, updatedAt: date2023 }))
    experts.push(create.expertHelper.create(em, { user }, { createdAt: date2023, updatedAt: date2023 }))

    // 2022
    const date2022 = new Date(2022, 1)
    experts.push(create.expertHelper.create(em, { user }, { createdAt: date2022, updatedAt: date2022 }))
    experts.push(create.expertHelper.create(em, { user }, { createdAt: date2022, updatedAt: date2022 }))

    // 2021
    const date2019 = new Date(2019, 1)
    experts.push(create.expertHelper.create(em, { user }, { createdAt: date2019, updatedAt: date2019 }))

    await em.flush()
    mocksReset()
  })

  it('GET /experts has valid response', async () => {
    const { body } = await supertest(getServer())
      .get(`/experts`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    expect(body.experts).to.have.length(6)
    for (let i = 0; i < 6; i++) {
      const expert = experts[i]
      const receivedExpert = body.experts[i]
      expect(receivedExpert).to.deep.include({
        id: expert.id,
        createdAt: expert.createdAt.toISOString(),
        updatedAt: expert.updatedAt.toISOString(),
        meta: {
          about: expert.meta?._about,
          blog: expert.meta?._blog,
          blogTitle: expert.meta?._blog_title,
          blogPreview: expert.meta?._challenge,
          title: expert.meta?._prefname,
          totalQuestionCount: await expert.getAnsweredQuestionsCount() +
                              await expert.getIgnoredQuestionsCount() +
                              await expert.getOpenQuestionsCount(),
          totalAnswerCount: await expert.getAnsweredQuestionsCount(),
        },
        state: ExpertState.OPEN,
        scope: ExpertScope.PUBLIC,
      })
    }
  })

  it('GET /experts/years has valid response', async () => {
    const { body } = await supertest(getServer())
      .get(`/experts/years`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    expect(body).to.deep.equal([
      2023,
      2022,
      2019,
    ])
  })
})
