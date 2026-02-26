import { http, HttpResponse } from 'msw'
import { SiteSettingsResponse } from '@/features/auth/useSiteSettingsQuery'
import { CloudResourcesResponse } from '@/hooks/useCloudResourcesCondition'

export const authHandlers = [
  http.get('https://localhost:3001/', () => HttpResponse.json({}, { status: 200 })),

  http.get('/assets/*', () =>
    HttpResponse.json(
      {
        user: {
          id: 5,
          dxuser: 'precisionfda.admin_dev',
          first_name: 'PrecisionFDA',
          last_name: 'Admin - Dev',
          full_name: 'PrecisionFDA Admin - Dev',
          email: 'pkryshenyk-cf+precisionfda.admin_dev@dnanexus.com',
          admin: true,
          links: {},
          job_limit: 100,
          pricing_map: {
            'baseline-2': 0.286,
            'baseline-4': 0.572,
            'baseline-8': 1.144,
            'baseline-16': 2.288,
            'baseline-36': 5.148,
            'hidisk-2': 0.372,
            'hidisk-4': 0.744,
            'hidisk-8': 1.488,
            'hidisk-16': 2.976,
            'hidisk-36': 6.696,
            'himem-2': 0.474,
            'himem-4': 0.948,
            'himem-8': 1.896,
            'himem-16': 3.792,
            'himem-32': 7.584,
            'gpu-8': 10.787,
            db_std1_x2: 0.273,
            db_mem1_x2: 0.967,
            db_mem1_x4: 1.933,
            db_mem1_x8: 3.867,
            db_mem1_x16: 7.733,
            db_mem1_x32: 15.467,
            db_mem1_x48: 23.2,
            db_mem1_x64: 30.933,
          },
          resources: ['baseline-2', 'baseline-4', 'hidisk-2', 'hidisk-4', 'himem-2', 'himem-4'],
          header_items: [],
          total_limit: 200,
          can_administer_site: true,
          can_create_challenges: true,
          can_see_spaces: true,
          review_space_admin: false,
          can_access_notification_preference: false,
          org: { id: 4, name: "Admin - Dev's org", handle: 'pamellaaccounttwo' },
        },
        meta: {
          links: {
            space_create: '/api/spaces',
            space_info: '/api/spaces/info',
            accessible_spaces: '/api/spaces/editable_spaces',
            accessible_apps: '/api/list_apps',
            accessible_workflows: '/api/list_workflows',
            accessible_files: '/api/list_files',
            challenge_new: '/challenges/new',
          },
        },
      },
      { status: 200 },
    ),
  ),

  http.get('/api/user/cloud_resources', () =>
    HttpResponse.json<CloudResourcesResponse>(
      {
        computeCharges: 0.0,
        totalCharges: 213.63821532049522,
        storageCharges: 213.29572,
        dataEgressCharges: 0.342495320495218,
        usageLimit: 300,
        jobLimit: 100,
        usageAvailable: 86.36178467950478,
      },
      { status: 200 },
    ),
  ),

  http.get('/api/v2/users/me/cloud-resources', () =>
    HttpResponse.json<CloudResourcesResponse>(
      {
        computeCharges: 0.0,
        totalCharges: 213.63821532049522,
        storageCharges: 213.29572,
        dataEgressCharges: 0.342495320495218,
        usageLimit: 300,
        jobLimit: 100,
        usageAvailable: 86.36178467950478,
      },
      { status: 200 },
    ),
  ),

  http.put('/api/v2/users/header-items', () => HttpResponse.json({}, { status: 200 })),

  http.get('/api/v2/site-settings', () =>
    HttpResponse.json<SiteSettingsResponse>(
      {
        ssoButton: {
          isEnabled: false,
        },
        cdmh: {
          isEnabled: true,
          data: {
            cdmhPortal: 'https://cdmh-portal.example.com',
            cdrBrowser: 'https://cdr-browser.example.com',
            cdrAdmin: 'https://cdr-admin.example.com',
            connectPortal: 'https://connect-portal.example.com',
          },
        },
        alerts: [
          {
            id: 20,
            createdAt: '2024-02-01T16:38:56.451Z',
            updatedAt: '2024-02-02T10:15:45.687Z',
            title: 'Site Maintenance',
            content: 'Notice: This site will undergo some things you would rather not know about.',
            type: 'warning',
            startTime: '2024-01-31T11:15:00.000Z',
            endTime: '2024-02-24T11:15:00.000Z',
          },
        ],
        dataPortals: {
          portal1: {
            accessible: true,
            tooltipText: 'Access Portal 1',
            mailto: 'support@portal1.example.com',
          },
        },
      },
      { status: 200 },
    ),
  ),

  http.get('/api/site_settings', () =>
    HttpResponse.json<SiteSettingsResponse>(
      {
        ssoButton: {
          isEnabled: false,
        },
        cdmh: {
          isEnabled: true,
          data: {
            cdmhPortal: 'https://cdmh-portal.example.com',
            cdrBrowser: 'https://cdr-browser.example.com',
            cdrAdmin: 'https://cdr-admin.example.com',
            connectPortal: 'https://connect-portal.example.com',
          },
        },
        alerts: [
          {
            id: 20,
            createdAt: '2024-02-01T16:38:56.451Z',
            updatedAt: '2024-02-02T10:15:45.687Z',
            title: 'Site Maintenance',
            content: 'Notice: This site will undergo some things you would rather not know about.',
            type: 'warning',
            startTime: '2024-01-31T11:15:00.000Z',
            endTime: '2024-02-24T11:15:00.000Z',
          },
        ],
        dataPortals: {
          portal1: {
            accessible: true,
            tooltipText: 'Access Portal 1',
            mailto: 'support@portal1.example.com',
          },
        },
      },
      { status: 200 },
    ),
  ),

  http.get('/api/auth_key', () =>
    HttpResponse.json(
      {
        Key: 'L0ZPKkhUeWxwT09rRlpoVitJMHJESW5Qa1hxLzR4NmUvUG1NSEw3Tkp2S2owT2paYzN4Szd5Q3hMeWdTTDhReUwxSGRHYjNqdWN6amNUalkwNE1XQi84SEVmdzE5MHRQcUdncTFsVkRQalk5b3BXM2poTUVTSVFrOEpEMXhmNk1sTFBCbXlpaUVRUWx1aGZ3Y1BPaUVxZ0REOTFqZEhMRFcyZ04zclM5NVduUzRqMTJaT2pVV1BrOG9BWENkbHpMLS10dWNPb1M0cAI2Vzg4ZDNSc3lrTlRRPT0=--369b49d04cb7322c879bda6fcbecdcf5546d3617',
      },
      { status: 200 },
    ),
  ),

  http.get('/api/user', () => {
    const isAuthenticated = true
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          errorMessage: 'Not authorized',
        },
        { status: 403 },
      )
    }
    return HttpResponse.json(
      {
        user: {
          id: 5,
          dxuser: 'lvoss',
          first_name: 'Leon',
          last_name: 'Voss',
          full_name: 'Dr. Leon Voss',
          email: 'lvoss@gmail.com',
          admin: true,
          links: {},
          job_limit: 100,
          pricing_map: {
            'baseline-2': 0.286,
            'baseline-4': 0.572,
            'baseline-8': 1.144,
            'baseline-16': 2.288,
            'baseline-36': 5.148,
            'hidisk-2': 0.372,
            'hidisk-4': 0.744,
            'hidisk-8': 1.488,
            'hidisk-16': 2.976,
            'hidisk-36': 6.696,
            'himem-2': 0.474,
            'himem-4': 0.948,
            'himem-8': 1.896,
            'himem-16': 3.792,
            'himem-32': 7.584,
            'gpu-8': 10.787,
            db_std1_x2: 0.273,
            db_mem1_x2: 0.967,
            db_mem1_x4: 1.933,
            db_mem1_x8: 3.867,
            db_mem1_x16: 7.733,
            db_mem1_x32: 15.467,
            db_mem1_x48: 23.2,
            db_mem1_x64: 30.933,
          },
          resources: ['baseline-2', 'baseline-4', 'hidisk-2', 'hidisk-4', 'himem-2', 'himem-4'],
          total_limit: 200,
          can_administer_site: true,
          can_create_challenges: true,
          can_see_spaces: true,
          review_space_admin: false,
          can_access_notification_preference: false,
          org: { id: 4, name: "Admin - Dev's org", handle: 'pamellaaccounttwo' },
        },
        meta: {
          links: {
            space_create: '/api/spaces',
            space_info: '/api/spaces/info',
            accessible_spaces: '/api/spaces/editable_spaces',
            accessible_apps: '/api/list_apps',
            accessible_workflows: '/api/list_workflows',
            accessible_files: '/api/list_files',
            challenge_new: '/challenges/new',
          },
        },
      },
      { status: 200 },
    )
  }),
]
