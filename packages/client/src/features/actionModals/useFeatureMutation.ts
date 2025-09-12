import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { APIResource } from '../home/types'
import axios from 'axios'

export interface Meta {
  type: 'success' | 'error';
  message: string;
}

export interface RequestResponse<T> {
  items: T[];
  meta: Meta[];
}

async function featureRequest<T>(resource: APIResource, { uids, featured }: { uids: (number | string)[], featured: boolean }): Promise<RequestResponse<T>> {
  const response = await axios.put(`/api/${resource}/feature`, {
    item_ids: uids,
    featured: featured || undefined,
  })
  
  return response.data
}

export const useFeatureMutation = <T extends {id: string|number}>({ resource, onSuccess }: { resource: APIResource, onSuccess?: (res: RequestResponse<T>) => void }) => {
  const featureMutation = useMutation({
    mutationKey: ['feature-resource', resource],
    mutationFn: (payload: { featured: boolean, uids: (number | string)[] }) => featureRequest<T>(resource, payload),
    onSuccess: async (res) => {
      if (res.meta[0].type === 'success') {
        toast.success(`Success: ${res.meta[0].message}`)
        if(onSuccess) onSuccess(res)
      } else {
        toast.error(`Error: ${res.meta[0].message}`)
      }
    },
    onError: (res: unknown) => {
      console.error('Error featuring resource:', res)
      toast.error('Error: featuring')
    },
  })

  return featureMutation
}
