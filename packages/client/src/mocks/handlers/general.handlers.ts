import { http, HttpResponse } from 'msw'
import { FetchProperties } from '../../features/home/usePropertiesQuery'

export const generalHandlers = [
  http.get('/api/list_licenses', () => HttpResponse.json({ licenses: []}, { status: 200 })),

  http.get('/api/properties/:type/scope/:scope/keys', () => 
    HttpResponse.json<FetchProperties>({ keys: []}, { status: 200 }),
  ),

  http.post('/api/files/download_list', () => HttpResponse.json([], { status: 200 })),

  http.get('/api/counters', () =>
    HttpResponse.json(
      { apps: '2', assets: '0', dbclusters: '0', jobs: 1, files: '0', workflows: '2' }, 
      { status: 200 },
    ),
  ),
]
