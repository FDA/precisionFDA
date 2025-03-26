import axios from 'axios'
import { TreeRoot } from './publishing.types'

export function fetchPublishingTreeRoot(identifier: string, type: string) {
  const url = `/api/v2/publish/tree-root?identifier=${identifier}&type=${type}`
  return axios.get<TreeRoot>(url).then(r => r.data)
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
