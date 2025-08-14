import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useUserSiteNavItems } from './useUserSiteNavItems'

export type NavFavorite = {
  name: string
  favorite: boolean
}

export const useNavFavorites = () => {
  const queryClient = useQueryClient()
  const { userSiteNavItems } = useUserSiteNavItems()

  const getDefaultFavorites = () => {
    return userSiteNavItems.map(siteNavItem => ({
      name: siteNavItem.id,
      favorite: ['home', 'spaces', 'docs'].includes(siteNavItem.id),
    }))
  }

  const validateAndFixFavorites = (favorites: NavFavorite[]) => {
    const validFavorites: NavFavorite[] = []

    favorites.forEach(item => {
      if (validFavorites.find(validItem => validItem.name === item.name)) return
      validFavorites.push({ name: item.name, favorite: item.favorite })
    })

    return validFavorites
  }

  const migrateFavorites = async (): Promise<NavFavorite[]> => {
    const navOrderString = localStorage.getItem('navOrder')
    const selectedNavFavoritesString = localStorage.getItem('selectedNavFavorites')

    let migratedFavorites = getDefaultFavorites()

    if (navOrderString) {
      const navOrder = JSON.parse(navOrderString) || []
      const navFavorites = selectedNavFavoritesString ? JSON.parse(selectedNavFavoritesString) : ['spaces', 'home', 'docs']

      migratedFavorites = navOrder.map((name: string) => {
        return { name, favorite: navFavorites.includes(name) }
      })
    }

    try {
      await axios.put('/api/v2/users/header-items', migratedFavorites)

      localStorage.removeItem('navOrder')
      localStorage.removeItem('selectedNavFavorites')
    } catch (error) {
      console.error('Error migrating navigation favorites:', error)
    }

    return migratedFavorites
  }

  // TODO: PFDA-6176 remove this fetch as it's part of user fetch response.
  const fetchFavorites = async (): Promise<NavFavorite[]> => {
    try {
      const response = await axios.get('/api/v2/users/header-items')
      return response.data
    } catch (error: unknown) {
      const err = error as { status: number }
      // TODO: PFDA-6176
      // This is a temporary code for migrating navigation items from local storage to backend
      // Should be removed once (almost) all the active users have "header_items" property in their "extras" column in the DB table "users"
      if (err.status === 422) {
        return await migrateFavorites()
      }
      // Not doing anything in case of other error code. It's not a critical feature, and we don't want to bother user with it
      return []
    }
  }

  const {
    data: selFavorites = getDefaultFavorites(),
    isLoading,
    error,
  } = useQuery({
    queryKey: ['header_items'],
    queryFn: fetchFavorites,
    staleTime: Infinity,
  })

  const updateFavoritesMutation = useMutation({
    mutationFn: async (favorites: NavFavorite[]) => {
      const validated = validateAndFixFavorites(favorites)
      await axios.put('/api/v2/users/header-items', validated)
      return validated
    },
    onSuccess: newFavorites => {
      queryClient.setQueryData(['header_items'], newFavorites)
    },
  })

  return {
    selFavorites,
    isLoading,
    error,
    updateFavorites: updateFavoritesMutation.mutateAsync,
  }
}
