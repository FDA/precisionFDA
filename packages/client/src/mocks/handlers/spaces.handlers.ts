import { http, HttpResponse } from 'msw'
import { indexBy } from 'ramda'
import { FetchSpaceDetailsResponse, FetchSpacesListResponse } from '../../features/spaces/spaces.api'
import { ISpace, ISpaceV2 } from '../../features/spaces/spaces.types'
import { SpaceMembership, ListMembersResponse } from '../../features/spaces/members/members.types'
import { IMeta } from '../../features/home/types'

export const mockTestSpace: ISpace = {
  id: 1,
  description: 'A test space for verification workflows',
  name: 'test-verification-space',
  type: 2, // VERIFICATION type
  state: 'locked',
  hidden: false,
  protected: false,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
  counters: {
    files: 0,
    apps: 0,
    workflows: 0,
    jobs: 0,
    members: 2,
    reports: 0,
    discussions: 0,
    dbclusters: 0,
  },
  links: {
    unlock: '/api/spaces/1/unlock',
    show: '/spaces/1',
  },
  updatable: true,
  tags: [],
  current_user_membership: {
    id: 1,
    user_id: 1,
    meta: {},
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    active: true,
    role: 'lead',
    side: 'host',
  },
  host_lead: {
    id: 1,
    dxuser: 'host@example.com',
    user_url: '/users/host@example.com',
    name: 'Host User',
    org: 'Host Org',
    is_accepted: true,
  },
  guest_lead: {
    id: 2,
    dxuser: 'guest@example.com',
    user_url: '/users/guest@example.com',
    name: 'Guest User',
    org: 'Guest Org',
    is_accepted: true,
  },
  confidential_space: null,
}

export const mockUnlockedTestSpace: ISpace = {
  ...mockTestSpace,
  state: 'active',
  links: {
    lock: '/api/spaces/1/lock',
    show: '/spaces/1',
  },
}

export const spaces = [
  {
    id: 1,
    description:
      'An avant-garde initiative weaving the fabric of spacetime with personal health data. By leveraging the principles of quantum biology and chrono-displacement, this initiative aims to predict and preemptively treat health conditions even before they manifest, effectively creating a healthcare paradigm that operates outside the conventional bounds of time and space.',
    state: 'active',
    name: 'Chronosynclastic Infundibulum Network',
    type: 'groups',
    cts: undefined,
    hidden: false,
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
      dbclusters: 0,
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
      id: 801,
      dxuser: 'randall.ebert',
      user_url: '/users/randall.ebert',
      name: 'Randall Ebert',
      org: 'Host Organization',
      is_accepted: true,
    },
    guest_lead: {
      id: 802,
      dxuser: 'sirius.black',
      user_url: '/users/sirius.black',
      name: 'Sirius Black',
      org: 'Guest Organization',
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
    cts: undefined,
    hidden:false,
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
      dbclusters: 0,
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
      id: 803,
      dxuser: 'stagingcypress.admin',
      user_url: '/users/stagingcypress.admin',
      name: 'Staging Cypress Admin',
      org: 'Staging Organization',
      is_accepted: true,
    },
  },
  {
    id: 3,
    description:
      'his network operates on the premise that our genetic code contains not just the blueprint of our past and present, but also the pathways to our future selves. Through a complex labyrinth of genomic analysis and time-entangled data processing, this initiative aims to navigate the intricate maze of human potential, unlocking pathways to unprecedented medical breakthroughs.',
    state: 'active',
    name: 'Labyrinth of Eons Network',
    type: 'review',
    cts: undefined,
    hidden: false,
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
      dbclusters: 0,
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
    current_user_membership: {
      id: 71678,
      user_id: 490,
      meta: {},
      created_at: '2023-12-27T09:48:44.000-02:00',
      updated_at: '2023-12-27T09:48:44.000-02:00',
      active: true,
      role: 'viewer',
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
] satisfies ISpace[]


export const spacesV2: ISpaceV2[] = [
  {
    id: 1,
    name: 'Chronosynclastic Infundibulum Network',
    description: 'An avant-garde initiative weaving the fabric of spacetime with personal health data. By leveraging the principles of quantum biology and chrono-displacement, this initiative aims to predict and preemptively treat health conditions even before they manifest, effectively creating a healthcare paradigm that operates outside the conventional bounds of time and space.',
    state: 'active',
    type: 'groups',
    hidden: false,
    hostLead: 'randall.ebert',
    guestLead: 'sirius.black',
    currentUserMembership: {
      id: 72838,
      user_id: 491,
      meta: {},
      created_at: '2024-01-17T19:50:37.000+03:00',
      updated_at: '2024-01-17T19:50:37.000+03:00',
      active: true,
      role: 'lead',
      side: 'guest',
    },
    protected: null,
    restrictedReviewer: null,
    tags: [],
    createdAt: '2024-01-17T00:00:00.000Z',
    updatedAt: '2024-01-17T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Helix Nebula Project',
    description: 'Inspired by the grandeur of cosmic formations, this project aims to map the genomic constellations of human DNA, drawing parallels between individual genetic markers and the celestial bodies. Utilizing astral algorithmic models, the Helix Nebula Project seeks to unlock cosmic patterns within our genetic code to pioneer treatments that are as unique as the stars in the sky.',
    state: 'unactivated',
    type: 'administrator',
    hidden: false,
    hostLead: 'stagingcypress.admin',
    guestLead: undefined,
    currentUserMembership: {
      id: 71677,
      user_id: 490,
      meta: {},
      created_at: '2023-12-27T09:48:44.000-02:00',
      updated_at: '2023-12-27T09:48:44.000-02:00',
      active: true,
      role: 'admin',
      side: 'host',
    },
    protected: true,
    restrictedReviewer: null,
    tags: [],
    createdAt: '2023-12-27T00:00:00.000Z',
    updatedAt: '2023-12-27T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Labyrinth of Eons Network',
    description: 'This network operates on the premise that our genetic code contains not just the blueprint of our past and present, but also the pathways to our future selves. Through a complex labyrinth of genomic analysis and time-entangled data processing, this initiative aims to navigate the intricate maze of human potential, unlocking pathways to unprecedented medical breakthroughs.',
    state: 'active',
    type: 'review',
    hidden: false,
    hostLead: 'stagingcypress.admin',
    guestLead: undefined,
    currentUserMembership: {
      id: 71678,
      user_id: 490,
      meta: {},
      created_at: '2023-12-27T09:48:44.000-02:00',
      updated_at: '2023-12-27T09:48:44.000-02:00',
      active: true,
      role: 'viewer',
      side: 'host',
    },
    protected: null,
    restrictedReviewer: null,
    tags: [],
    createdAt: '2023-12-27T00:00:00.000Z',
    updatedAt: '2023-12-27T00:00:00.000Z',
  },
]

export const spacesById = indexBy(s => s.id, spaces)

export const mockMembers: SpaceMembership[] = [
  {
    id: 1,
    user_name: 'john.doe',
    title: 'John Doe',
    active: true,
    role: 'contributor',
    side: 'host',
    org: 'Example Org',
    domain: 'example.com',
    created_at: '2024-01-01T10:00:00Z',
    links: {
      user: '/users/john.doe',
    },
    to_roles: ['viewer', 'contributor', 'admin'],
  },
  {
    id: 2,
    user_name: 'jane.smith',
    title: 'Jane Smith',
    active: true,
    role: 'viewer',
    side: 'guest',
    org: 'Guest Org',
    domain: 'guest.com',
    created_at: '2024-01-01T11:00:00Z',
    links: {
      user: '/users/jane.smith',
    },
    to_roles: ['viewer', 'contributor'],
  },
  {
    id: 3,
    user_name: 'admin.user',
    title: 'Admin User',
    active: true,
    role: 'admin',
    side: 'host',
    org: 'Example Org',
    domain: 'example.com',
    created_at: '2024-01-01T09:00:00Z',
    links: {
      user: '/users/admin.user',
    },
    to_roles: ['admin', 'lead'],
  },
]

export const spacesMocks = [
  http.post('/api/spaces/:id/unlock', ({ params }) => {
    const id = parseInt(params.id as string)
    const space = spacesById[id]
    if (!space) {
      return HttpResponse.json({ error: 'Space not found' }, { status: 404 })
    }
    
    const unlockedSpace = {
      ...space,
      state: 'active' as const,
      links: {
        ...space.links,
        lock: `/api/spaces/${id}/lock`,
        unlock: undefined,
      },
    }
    
    return HttpResponse.json({
      space: unlockedSpace,
      meta: {
        messages: [{ type: 'success', message: 'Space unlocked successfully' }],
      },
    })
  }),
  http.post('/api/spaces/:id/lock', ({ params }) => {
    const id = parseInt(params.id as string)
    const space = spacesById[id]
    if (!space) {
      return HttpResponse.json({ error: 'Space not found' }, { status: 404 })
    }
    
    const lockedSpace = {
      ...space,
      state: 'locked' as const,
      links: {
        ...space.links,
        unlock: `/api/spaces/${id}/unlock`,
        lock: undefined,
      },
    }
    
    return HttpResponse.json({
      space: lockedSpace,
      meta: {
        messages: [{ type: 'success', message: 'Space locked successfully' }],
      },
    })
  }),
  http.post('/api/spaces/:spaceId/memberships/invite', () => {
    return HttpResponse.json({
      space_memberships: [
        {
          id: 4,
          user_name: 'new.user',
          title: 'New User',
          active: true,
          role: 'contributor',
          side: 'host',
          org: 'Example Org',
          domain: 'example.com',
          created_at: new Date().toISOString(),
          links: { user: '/users/new.user' },
          to_roles: ['viewer', 'contributor'],
        },
      ],
      meta: {
        messages: [{ type: 'success', message: 'Members added successfully' }],
      },
    })
  }),

  http.post('/api/spaces/:spaceId/invite', () => {
    return HttpResponse.json({
      space_memberships: [
        {
          id: 4,
          user_name: 'new.user',
          title: 'New User',
          active: true,
          role: 'contributor',
          side: 'host',
          org: 'Example Org',
          domain: 'example.com',
          created_at: new Date().toISOString(),
          links: { user: '/users/new.user' },
          to_roles: ['viewer', 'contributor'],
        },
      ],
      meta: {
        messages: [{ type: 'success', message: 'Members added successfully' }],
      },
    })
  }),
  http.patch('/api/spaces/:spaceId/memberships/:memberId', ({ params }) => {
    const memberId = parseInt(params.memberId as string)
    const member = mockMembers.find(m => m.id === memberId)
    return HttpResponse.json({
      space_membership: {
        ...member,
        role: 'admin', // Mock changed role
      },
      meta: {
        messages: [{ type: 'success', message: 'Member role updated successfully' }],
      },
    })
  }),

  http.put('/api/space_memberships/:memberId', ({ params }) => {
    const memberId = parseInt(params.memberId as string)
    const member = mockMembers.find(m => m.id === memberId)
    return HttpResponse.json({
      space_membership: {
        ...member,
        role: 'admin', // Mock changed role
      },
      meta: {
        messages: [{ type: 'success', message: 'Member role updated successfully' }],
      },
    })
  }),

  http.get('/api/spaces/:spaceId/members', () => {
    return HttpResponse.json<ListMembersResponse>({
      space_memberships: mockMembers,
    })
  }),
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
  http.get('/api/spaces/:id', ({ params }) => {
    const id = typeof params.id === 'string' ? parseInt(params.id, 10) : 0
    return HttpResponse.json<FetchSpaceDetailsResponse>({ space: spacesById[id], meta: {}})
  }),
  http.get('/api/spaces/', () =>
    HttpResponse.json<{ meta: IMeta; data: ISpace[] }>(
      {
        data: spaces,
        meta: {
          count: 20,
          pagination: {
            current_page: 56,
            next_page: 57,
            prev_page: 55,
            total_pages: 57,
            total_count: 1135,
          },
          challenges: [],
        },
      },
      { status: 200 },
    ),
  ),
  http.get('/api/v2/spaces/', () =>
    HttpResponse.json<FetchSpacesListResponse>(
      {
        data: spacesV2,
        meta: {
          page: 56,
          pageSize: 20,
          total: 1135,
          totalPages: 57,
        },
      },
      { status: 200 },
    ),
  ),
]
