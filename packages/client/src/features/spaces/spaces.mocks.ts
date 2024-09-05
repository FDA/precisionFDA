import { http, HttpResponse } from 'msw'
import { indexBy } from 'ramda'
import { FetchSpaceDetailsResponse, FetchSpacesListResponse } from './spaces.api'
import { ISpace } from './spaces.types'

export const spaces = [
  {
    id: 1,
    description:
      'An avant-garde initiative weaving the fabric of spacetime with personal health data. By leveraging the principles of quantum biology and chrono-displacement, this initiative aims to predict and preemptively treat health conditions even before they manifest, effectively creating a healthcare paradigm that operates outside the conventional bounds of time and space.',
    state: 'active',
    name: 'Chronosynclastic Infundibulum Network',
    type: 'groups',
    cts: null,
    created_at: '01/17/2024',
    updated_at: '01/17/2024',
    counters: {
      files: 0,
      apps: 0,
      workflows: 0,
      jobs: 0,
      members: 2,
      reports: 0,
      discussions: 0,
    },
    links: {
      add_data: '/api/spaces/7424-something/add_data',
      show: '/api/spaces/7424-something',
      update: '/api/spaces/7424-something',
      update_tags: '/api/spaces/7424-something/tags',
      apps: '/api/apps',
      files: '/api/files',
      workflows: '/api/workflows',
      jobs: '/api/jobs',
      members: '/api/spaces/7424-something/members',
    },
    updatable: true,
    protected: null,
    restricted_reviewer: null,
    tags: [],
    current_user_membership: {
      id: 72838,
      user_id: 491,
      meta: {},
      created_at: '2024-01-17T19:50:37.000+03:00',
      updated_at: '2024-01-17T19:50:37.000+03:00',
      active: true,
      role: 'lead',
      side: 'guest',
    },
    host_lead: {
      id: 490,
      dxuser: 'randall.ebert',
      user_url: '/users/randall.ebert',
      name: 'Randall Ebert',
      org: "Ebert's org",
      is_accepted: true,
    },
    guest_lead: {
      id: 491,
      dxuser: 'sirius.black',
      user_url: '/users/sirius.black',
      name: 'Sirius Black',
      org: "Black's org",
      is_accepted: true,
    },
  },
  {
    id: 2,
    description:
      'Inspired by the grandeur of cosmic formations, this project aims to map the genomic constellations of human DNA, drawing parallels between individual genetic markers and the celestial bodies. Utilizing astral algorithmic models, the Helix Nebula Project seeks to unlock cosmic patterns within our genetic code to pioneer treatments that are as unique as the stars in the sky.',
    state: 'unactivated',
    name: 'Helix Nebula Project',
    type: 'administrator',
    cts: null,
    created_at: '12/27/2023',
    updated_at: '12/27/2023',
    counters: {
      files: 0,
      apps: 0,
      workflows: 0,
      jobs: 0,
      members: 59,
      reports: 0,
      discussions: 0,
    },
    links: {
      add_data: '/api/spaces/7352-cypress-administrator-space-for-members-20231127115646/add_data',
      show: '/api/spaces/7352-cypress-administrator-space-for-members-20231127115646',
      update: '/api/spaces/7352-cypress-administrator-space-for-members-20231127115646',
      update_tags: '/api/spaces/7352-cypress-administrator-space-for-members-20231127115646/tags',
      apps: '/api/apps',
      files: '/api/files',
      workflows: '/api/workflows',
      jobs: '/api/jobs',
      members: '/api/spaces/7352-cypress-administrator-space-for-members-20231127115646/members',
    },
    updatable: true,
    protected: true,
    restricted_reviewer: null,
    tags: [],
    current_user_membership: {
      id: 71677,
      user_id: 490,
      meta: {},
      created_at: '2023-12-27T09:48:44.000-02:00',
      updated_at: '2023-12-27T09:48:44.000-02:00',
      active: true,
      role: 'admin',
      side: 'host',
    },
    host_lead: {
      id: 802,
      dxuser: 'stagingcypress.admin',
      user_url: '/users/stagingcypress.admin',
      name: 'Staging Cypress Admin',
      org: 'Stagingcypress Admin',
      is_accepted: true,
    },
    confidential_space: null,
  },
  {
    id: 3,
    description:
      'his network operates on the premise that our genetic code contains not just the blueprint of our past and present, but also the pathways to our future selves. Through a complex labyrinth of genomic analysis and time-entangled data processing, this initiative aims to navigate the intricate maze of human potential, unlocking pathways to unprecedented medical breakthroughs.',
    state: 'active',
    name: 'Labyrinth of Eons Network',
    type: 'review',
    cts: null,
    created_at: '12/27/2023',
    updated_at: '12/27/2023',
    counters: {
      files: 2,
      apps: 0,
      workflows: 0,
      jobs: 0,
      members: 59,
      reports: 0,
      discussions: 0,
    },
    links: {
      add_data: '/api/spaces/7353-cypress-administrator-space-20231127115646/add_data',
      show: '/api/spaces/7353-cypress-administrator-space-20231127115646',
      update: '/api/spaces/7353-cypress-administrator-space-20231127115646',
      update_tags: '/api/spaces/7353-cypress-administrator-space-20231127115646/tags',
      apps: '/api/apps',
      files: '/api/files',
      workflows: '/api/workflows',
      jobs: '/api/jobs',
      members: '/api/spaces/7353-cypress-administrator-space-20231127115646/members',
    },
    updatable: true,
    protected: null,
    restricted_reviewer: null,
    tags: [],
    current_user_membership: null,
    host_lead: {
      id: 802,
      dxuser: 'stagingcypress.admin',
      user_url: '/users/stagingcypress.admin',
      name: 'Staging Cypress Admin',
      org: 'Stagingcypress Admin',
      is_accepted: true,
    },
    confidential_space: null,
  },
] satisfies ISpace[]

export const spacesById = indexBy(s => s.id, spaces)

export const spacesMocks = [
  http.get('/api/spaces/editable_spaces', () =>
    HttpResponse.json(
      [
        { scope: 'space-1445', name: 'admin test', type: 'administrator', title: 'admin test (Administrator)', protected: false },
        {
          scope: 'space-1442',
          name: 'isdgfoiauwgfoawijgf',
          type: 'administrator',
          title: 'isdgfoiauwgfoawijgf (Administrator)',
          protected: false,
        },
        {
          scope: 'space-1436',
          name: 'My Awesome Space',
          type: 'private_type',
          title: 'My Awesome Space (Private)',
          protected: false,
        },
        {
          scope: 'space-1451',
          name: 'My Private Space',
          type: 'private_type',
          title: 'My Private Space (Private)',
          protected: false,
        },
        {
          scope: 'space-1479',
          name: 'Our Very Best Challenge',
          type: 'groups',
          title: 'Our Very Best Challenge (Group)',
          protected: false,
        },
        {
          scope: 'space-1450',
          name: 'private challenge space',
          type: 'private_type',
          title: 'private challenge space (Private)',
          protected: false,
        },
        { scope: 'space-1440', name: 'som hladny', type: 'administrator', title: 'som hladny (Administrator)', protected: false },
        { scope: 'space-1454', name: 'test', type: 'groups', title: 'test (Group)', protected: false },
        {
          scope: 'space-1439',
          name: 'test admin space pls work',
          type: 'administrator',
          title: 'test admin space pls work (Administrator)',
          protected: false,
        },
        {
          scope: 'space-1405',
          name: 'Test for creating challenge',
          type: 'groups',
          title: 'Test for creating challenge (Group)',
          protected: false,
        },
        {
          scope: 'space-1441',
          name: 'test pls work i just wanna merge it',
          type: 'administrator',
          title: 'test pls work i just wanna merge it (Administrator)',
          protected: false,
        },
        {
          scope: 'space-1444',
          name: 'test private space',
          type: 'private_type',
          title: 'test private space (Private)',
          protected: true,
        },
        {
          scope: 'space-1443',
          name: 'test422',
          type: 'administrator',
          title: 'test422 (Administrator)',
          protected: false,
          restricted_reviewer: true,
        },
        {
          scope: 'space-1446',
          name: 'testsests',
          type: 'administrator',
          title: 'testsests (Administrator)',
          protected: true,
          restricted_reviewer: true,
        },
      ],
      { status: 200 },
    ),
  ),
  http.get('/api/spaces/:id', ({ params }) =>
    HttpResponse.json<FetchSpaceDetailsResponse>({ space: spacesById[parseInt(params.id, 10)], meta: {} }),
  ),
  http.get('/api/spaces/', () =>
    HttpResponse.json<FetchSpacesListResponse>(
      {
        spaces: spaces,
        meta: {
          count: 20,
          pagination: {
            current_page: 56,
            next_page: 57,
            prev_page: 55,
            total_pages: 57,
            total_count: 1135,
          },
        },
      },
      { status: 200 },
    ),
  ),
]