import axios from 'axios'
import { ServerScope } from '../home/types'
import { IComparison } from './comparisons.types'

export async function fetchFilteredComparisons(searchString: string, scopes: ServerScope[]): Promise<IComparison[]> {
  return axios.post('/api/list_comparisons', {
    scopes,
    search_string: searchString,
    describe: {
      include: {
        user: true,
        org: true,
        all_tags_list: false,
      },
    },
    offset: 0,
    limit: 1000,
  }).then(r => r.data as IComparison[])
}