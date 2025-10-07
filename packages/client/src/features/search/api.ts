import axios from 'axios'
import { SearchRequestParams, SearchResponse } from './types'

export async function searchRequest(params: SearchRequestParams) {
  const res = await axios.get<SearchResponse>('/api/v2/search', { params })
  return res.data
}
