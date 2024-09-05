import { http, HttpResponse } from 'msw'
import { NewsListResponse } from './api'
import { NewsItem } from './types'

export const newsMocks = [
  http.get('/api/news', () => HttpResponse.json<NewsListResponse>({
    'news_items': [
      {
        'id': 80,
        'updatedAt': '2024-01-11T13:55:25.000Z',
        'title': 'Interview with the former FDA Chief Health Informatics Officer about precisionFDA',
        'link': 'https://www.youtube.com/watch?v=JCcpyJz49jE',
        'createdAt': '2024-01-11T13:55:25.000Z',
        'content': '',
        'video': 'https://www.youtube.com/embed/JCcpyJz49jE',
        'position': -79,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 79,
        'updatedAt': '2024-01-11T13:55:25.000Z',
        'title': 'Optimizing regulatory oversight for Next Generation Sequencing tests',
        'link': 'http://www.fda.gov/ScienceResearch/SpecialTopics/PrecisionMedicine/default.htm',
        'createdAt': '2024-01-11T13:55:25.000Z',
        'content': 'In support of the White House’s Precision Medicine Initiative, the FDA issued two draft guidances that offer a streamlined approach to the oversight of ‘Next Generation Sequencing’ tests that detect medically important differences in a person’s genomic makeup.',
        'video': '',
        'position': -78,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 78,
        'updatedAt': '2024-01-11T13:55:25.000Z',
        'title': 'Reference Viral DataBase v10.2',
        'link': 'https://hive.biochemistry.gwu.edu/rvdb',
        'createdAt': '2024-01-11T13:55:25.000Z',
        'content': 'New in May 2017, the NGS Reference Virus Database version 10.2 (unclustered and clustered).',
        'video': '',
        'position': -77,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 77,
        'updatedAt': '2024-01-11T13:55:25.000Z',
        'title': 'FDA approves first cancer treatment for any solid tumor with a specific genetic feature',
        'link': 'https://www.fda.gov/NewsEvents/Newsroom/PressAnnouncements/ucm560167.htm',
        'createdAt': '2024-01-11T13:55:25.000Z',
        'content': 'The U.S. Food and Drug Administration today granted accelerated approval to a treatment for patients whose cancers have a specific genetic feature (biomarker). This is the first time the agency has approved a cancer treatment based on a common biomarker rather than the location in the body where the tumor originated.',
        'video': '',
        'position': -76,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 76,
        'updatedAt': '2024-01-11T13:55:25.000Z',
        'title': "Q\u0026A: FDA Dx Reviewer's Tips For Next-Gen Sequencing Sponsors",
        'link': 'https://medtech.pharmamedtechbi.com/MT105058/QampA-FDA-Dx-Reviewers-Tips-For-NextGen-Sequencing-Sponsors',
        'createdAt': '2024-01-11T13:55:25.000Z',
        'content': "A top reviewer in US FDA's in vitro diagnostics office offers tips to next-generation sequencing test sponsors to avoid common submission shortcomings in this interview with Medtech Insight. According to FDA's Hisani Madison, sponsors frequently fall short in providing a refined intended-use statement.",
        'video': '',
        'position': -75,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 75,
        'updatedAt': '2024-01-09T13:45:33.000Z',
        'title': 'Interview with the former FDA Chief Health Informatics Officer about precisionFDA',
        'link': 'https://www.youtube.com/watch?v=JCcpyJz49jE',
        'createdAt': '2024-01-09T13:45:33.000Z',
        'content': '',
        'video': 'https://www.youtube.com/embed/JCcpyJz49jE',
        'position': -74,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 72,
        'updatedAt': '2024-01-09T13:45:32.000Z',
        'title': 'FDA approves first cancer treatment for any solid tumor with a specific genetic feature',
        'link': 'https://www.fda.gov/NewsEvents/Newsroom/PressAnnouncements/ucm560167.htm',
        'createdAt': '2024-01-09T13:45:32.000Z',
        'content': 'The U.S. Food and Drug Administration today granted accelerated approval to a treatment for patients whose cancers have a specific genetic feature (biomarker). This is the first time the agency has approved a cancer treatment based on a common biomarker rather than the location in the body where the tumor originated.',
        'video': '',
        'position': -71,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 71,
        'updatedAt': '2024-01-09T13:45:32.000Z',
        'title': "Q\u0026A: FDA Dx Reviewer's Tips For Next-Gen Sequencing Sponsors",
        'link': 'https://medtech.pharmamedtechbi.com/MT105058/QampA-FDA-Dx-Reviewers-Tips-For-NextGen-Sequencing-Sponsors',
        'createdAt': '2024-01-09T13:45:32.000Z',
        'content': "A top reviewer in US FDA's in vitro diagnostics office offers tips to next-generation sequencing test sponsors to avoid common submission shortcomings in this interview with Medtech Insight. According to FDA's Hisani Madison, sponsors frequently fall short in providing a refined intended-use statement.",
        'video': '',
        'position': -70,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 73,
        'updatedAt': '2024-01-09T13:45:32.000Z',
        'title': 'Reference Viral DataBase v10.2',
        'link': 'https://hive.biochemistry.gwu.edu/rvdb',
        'createdAt': '2024-01-09T13:45:32.000Z',
        'content': 'New in May 2017, the NGS Reference Virus Database version 10.2 (unclustered and clustered).',
        'video': '',
        'position': -72,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
      {
        'id': 74,
        'updatedAt': '2024-01-09T13:45:33.000Z',
        'title': 'Optimizing regulatory oversight for Next Generation Sequencing tests',
        'link': 'http://www.fda.gov/ScienceResearch/SpecialTopics/PrecisionMedicine/default.htm',
        'createdAt': '2024-01-09T13:45:32.000Z',
        'content': 'In support of the White House’s Precision Medicine Initiative, the FDA issued two draft guidances that offer a streamlined approach to the oversight of ‘Next Generation Sequencing’ tests that detect medically important differences in a person’s genomic makeup.',
        'video': '',
        'position': -73,
        'published': true,
        'isPublication': false,
        'userId': null,
        'user': null,
        'when': null,
      },
    ],
    'meta': {
      'current_page': 1,
      'next_page': 2,
      'prev_page': null,
      'total_pages': 8,
      'total_count': 80,
    },
  }, { status: 200 })),
  http.get('/api/news/all*', () => HttpResponse.json<NewsItem[]>([], { status: 200 })),
  http.get('/api/news/:id', () => HttpResponse.json({ 'id': 13, 'title': 'aaa', 'link': 'https://google.com', 'when': null, 'content': '', 'user_id': 123, 'video': '', 'position': -3, 'published': true, 'created_at': '2023-04-03T14:50:04.000Z', 'updated_at': '2023-04-03T14:50:04.000Z' }, { status: 200 })),
]
