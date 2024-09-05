import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { checkStatus, getApiRequestOpts } from '../../utils/api'
import { APIResource } from '../home/types'

export interface Meta {
  type: 'success' | 'error';
  message: string;
}

export interface RequestResponse {
  items: any[];
  meta: Meta[];
}

async function featureRequest(resource: APIResource, { uids, featured }: { uids: (number | string)[], featured: boolean }): Promise<RequestResponse> {
  const res = await fetch(`/api/${resource}/feature`, {
    ...getApiRequestOpts('PUT'),
    body: JSON.stringify({ item_ids: uids, featured: featured || undefined }),
  }).then(checkStatus)
  return res.json()
}

export const useFeatureMutation = ({ resource, onSuccess }: { resource: APIResource, onSuccess?: (res: any) => void }) => {
  const featureMutation = useMutation({
    mutationKey: ['feature-resource', resource],
    mutationFn: (payload: { featured: boolean, uids: (number | string)[] }) => featureRequest(resource, payload),
    onSuccess: async (res) => {
      if (res.meta[0].type === 'success') {
        toast.success(`Success: ${res.meta[0].message}`)
        if(onSuccess) onSuccess(res)
      } else {
        toast.error(`Error: ${res.meta[0].message}`)
      }
    },
    onError: (res) => {
      toast.error('Error: featuring')
    },
  })

  return featureMutation
}
