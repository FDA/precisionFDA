import { database } from '@shared/database'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { create, generate, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('/news', () => {
  let em: EntityManager
  let user1: User
  let user2: User
  let siteAdmin: User
  let news: NewsItem[]

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()

    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    siteAdmin = create.userHelper.createSiteAdmin(em)

    // Create a series of news, some are publications and some are not published
    news = []
    const createMockNewsItem = (u: User, date: Date, isPublication: boolean, published: boolean) => {
      news.push(create.newsHelper.create(em, { user: u }, {
        createdAt: date,
        updatedAt: date,
        isPublication,
        published,
      }))
    }
    const getUTCDate = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day))

    // 2023
    createMockNewsItem(user1, getUTCDate(2023, 3, 1), false, true)
    createMockNewsItem(user2, getUTCDate(2023, 2, 1), true, true)
    createMockNewsItem(siteAdmin, getUTCDate(2023, 1, 2), true, false)
    createMockNewsItem(siteAdmin, getUTCDate(2023, 1, 1), false, true)

    // 2022
    createMockNewsItem(siteAdmin, getUTCDate(2022, 12, 1), true, true)
    createMockNewsItem(user2, getUTCDate(2022, 11, 1), false, true)
    createMockNewsItem(user2, getUTCDate(2022, 10, 1), false, true)
    createMockNewsItem(user1, getUTCDate(2022, 9, 1), true, false)
    createMockNewsItem(siteAdmin, getUTCDate(2022, 8, 1), false, false)
    createMockNewsItem(user1, getUTCDate(2022, 7, 1), false, true)

    // 2020
    createMockNewsItem(user1, getUTCDate(2020, 12, 1), false, true)
    createMockNewsItem(user2, getUTCDate(2020, 11, 1), true, true)
    createMockNewsItem(siteAdmin, getUTCDate(2020, 10, 1), false, true)
    createMockNewsItem(user1, getUTCDate(2020, 1, 1), false, false)

    // 2019
    createMockNewsItem(siteAdmin, getUTCDate(2019, 12, 1), false, true)
    createMockNewsItem(user1, getUTCDate(2019, 5, 1), false, true)

    await em.flush()
    mocksReset()
  })

  it('GET /news public access', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/news`)
      .expect(200)

    const newsItems = body.news_items
    expect(newsItems).to.have.length(10)

    const expectedResults = newsItems.filter((item: NewsItem) => item.published === true)

    for (let i = 0; i < 10; i++) {
      const item = expectedResults[i]
      const received = newsItems[i]
      expect(received).to.deep.include({
        title: item.title,
        content: item.content,
        link: item.link,
      })
    }
  })

  it('GET /news public access with pagination', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/news`)
      .query({ page: 2 })
      .expect(200)

    const newsItems = body.news_items
    expect(newsItems).to.have.length(2)

    newsItems.forEach((x: NewsItem) => expect(x.published).to.be.true())
  })

  it('GET /news public access with publication filter', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/news`)
      .query({ type: 'publication' })
      .expect(200)

    const newsItems = body.news_items
    const expectedResults = news.filter((item: NewsItem) => {
      return item.published && item.isPublication
    })

    expect(newsItems).to.have.length(expectedResults.length)

    newsItems.forEach((x: NewsItem) => expect(x.isPublication).to.be.true())
    newsItems.forEach((x: NewsItem) => expect(x.published).to.be.true())
  })

  it('GET /news public access with year filter', async () => {
    let response = await supertest(testedApp.getHttpServer())
      .get(`/news`)
      .query({ year: 2022 })
      .expect(200)

    let expectedResults = news.filter((item: NewsItem) => {
      return item.published && item.year === 2022
    })
    expect(response.body.news_items).to.have.length(expectedResults.length)

    response = await supertest(testedApp.getHttpServer())
      .get(`/news`)
      .query({ year: 2020 })
      .expect(200)

    expectedResults = news.filter((item: NewsItem) => {
      return item.published && item.year === 2020
    })
    expect(response.body.news_items).to.have.length(expectedResults.length)
  })

  // TODO: Complete this test, but first need to define what htis API does
  //       when user1 is logged in (will depend on which page accesses this)
  it('GET /news accessed by user1', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/news`)
      .set(getDefaultHeaderData(user1))
      .expect(200)

    const newsItems = body.news_items
    const expectedResults = news.filter((item: NewsItem) => {
      return item.published
    })

    expect(newsItems).to.have.length(10)

    for (let i = 0; i < 10; i++) {
      const item = expectedResults[i]
      const received = newsItems[i]
      expect(received).to.deep.include({
        title: item.title,
        content: item.content,
      })
    }
  })

  it('GET /news/all accessed by site admin', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/news/all`)
      .set(getDefaultHeaderData(siteAdmin))
      .expect(200)

    const newsItems = body
    expect(newsItems[1].published).to.be.true()
    expect(newsItems[2].published).to.be.false()
    expect(newsItems[3].published).to.be.true()
  })

  it('POST /news works', async () => {
    const data = generate.news.create()
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/news`)
      .set(getDefaultHeaderData(siteAdmin))
      .send(data)
      .expect(201)
    expect(body).to.deep.include(data)

    const newsRepo = em.getRepository(NewsItem)
    const newsItemFromDb = await newsRepo.findOne({ id: body.id })
    expect(newsItemFromDb).to.deep.include(data)
  })

  it('POST /news doesn\'t work if not site admin', async () => {
    const data = generate.news.create()
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/news`)
      .set(getDefaultHeaderData(user1))
      .send(data)
      .expect(403)
  })
})
