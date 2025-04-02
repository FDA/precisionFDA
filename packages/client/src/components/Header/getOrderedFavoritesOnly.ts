import { NavFavorite } from './useNavFavorites'

export function getOrderedFavoritesOnly(items: NavFavorite[]) {
  return items.filter(item => item.favorite).map(item => item.name)
}
