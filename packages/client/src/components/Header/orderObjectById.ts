import { SiteNavItemType } from './NavItems'

export function getObjectsByIds(ids: string[], items: SiteNavItemType[]) {
  const itemMap = Object.fromEntries(items.map(item => [item.id, item]))
  return ids.map(id => itemMap[id]).filter(Boolean) as SiteNavItemType[]
}
