import axios from 'axios'
import { TreeRoot } from './publishing.types'

export async function fetchPublishingTreeRoot(identifier: string, type: string) {
  const url = `/api/v2/publish/tree-root?identifier=${identifier}&type=${type}`
  const r = await axios.get<TreeRoot>(url)
  return r.data
}

export function publishObjects(publishedId: string, objects: string[]) {
  return axios.post(
    '/api/publish',
    {
      identifier: publishedId,
      scope: 'public',
      ...objects.concat(publishedId).reduce(
        (acc, id) => {
          acc[`uids[${id}]`] = 'on'
          return acc
        },
        {} as Record<string, string>,
      ),
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
}

export async function publishFolder(publishedId: string) {
  const response = await axios.post('/api/v2/publish', {
    identifier: publishedId,
  })

  return response.data
}
