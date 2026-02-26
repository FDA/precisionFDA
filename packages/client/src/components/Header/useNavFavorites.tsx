import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { IUser } from '@/types/user'

export type NavFavorite = {
  name: string
  favorite: boolean
}

const validateAndFixFavorites = (favorites: NavFavorite[]) => {
  const validFavorites: NavFavorite[] = []

  favorites.forEach(item => {
    if (validFavorites.find(validItem => validItem.name === item.name)) return
    validFavorites.push({ name: item.name, favorite: item.favorite })
  })

  return validFavorites
}

export const useUpdateFavoritesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (favorites: NavFavorite[]) => {
      const validated = validateAndFixFavorites(favorites)
      await axios.put('/api/v2/users/header-items', validated)
      return validated
    },
    onSuccess: (newFavorites) => {
      queryClient.setQueryData<{ user: IUser; meta: any }>(['auth-user'], (old) => {
        if (!old) return old
        return { ...old, user: { ...old.user, header_items: newFavorites } }
      })
    },
  })
}
