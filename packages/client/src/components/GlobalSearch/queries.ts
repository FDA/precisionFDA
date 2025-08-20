import { useQuery } from '@tanstack/react-query'
import { searchRequest } from '../../features/search/api'
import { toast } from 'react-toastify'
import { FilterType } from './types'
import axios from 'axios'

export const useSearchChallenges = (searchQuery: string, selectedFilter: FilterType) => {
  return useQuery({
    queryKey: ['search-challenges', searchQuery],
    queryFn: () =>
      searchRequest({ query: searchQuery, entityType: 'challenge' }).catch(err => {
        if (err && err.message) toast.error(err.message)
        return []
      }),
    enabled: !!searchQuery.trim() && (selectedFilter === 'all' || selectedFilter === 'challenges'),
  })
}

export const useSearchExperts = (searchQuery: string, selectedFilter: FilterType) => {
  return useQuery({
    queryKey: ['search-experts', searchQuery],
    queryFn: () =>
      searchRequest({ query: searchQuery, entityType: 'expert' }).catch(err => {
        if (err && err.message) toast.error(err.message)
        return []
      }),
    enabled: !!searchQuery.trim() && (selectedFilter === 'all' || selectedFilter === 'expert-blogs'),
  })
}

export const useSearchQuestions = (searchQuery: string, selectedFilter: FilterType) => {
  return useQuery({
    queryKey: ['search-questions', searchQuery],
    queryFn: () =>
      searchRequest({ query: searchQuery, entityType: 'expertQuestion' }).catch(err => {
        if (err && err.message) toast.error(err.message)
        return []
      }),
    enabled: !!searchQuery.trim() && (selectedFilter === 'all' || selectedFilter === 'qa-pages'),
  })
}

export const useSearchDocs = (searchQuery: string, selectedFilter: FilterType) => {
  return useQuery({
    queryKey: ['search-docs', searchQuery],
    queryFn: async () => {
      try {
        const response = await axios.get(`/docs/api/search?query=${encodeURIComponent(searchQuery)}`)
        if (Array.isArray(response.data)) {
          return response.data.map((doc: { title?: string; name?: string; description?: string; content?: string; url?: string; link?: string }) => ({
            title: doc.title || doc.name || '',
            description: doc.description || doc.content || 'Documentation content',
            link: doc.url ? `/docs${doc.url}` : (doc.link ? `/docs${doc.link}` : '#'),
          }))
        }
        return []
      } catch (err) {
        const error = err as Error
        if (error && error.message) toast.error(error.message)
        return []
      }
    },
    enabled: !!searchQuery.trim() && (selectedFilter === 'all' || selectedFilter === 'documentation'),
  })
}
