import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type FetchProvenance = {
  identifier: string
  name: string
  svg: string
}

function fetchProvenanceByUid(identifier: string) {
  const url = `/api/tracks/provenance?identifier=${identifier}`
  return axios.get<FetchProvenance>(url).then(r => r.data)
}

export const useTrackProvenanceQuery = (identifier: string) => {
  return useQuery({
    queryKey: [identifier, 'provenance'],
    queryFn: () => fetchProvenanceByUid(identifier),
  })
}
