export const truncateText = (text: string, maxLength = 50) => {
  return text.length <= maxLength ? text : text.slice(0, maxLength).trim() + '…'
}

export const getDefaultSpaceUrl = (isSiteAdmin: boolean): string => {
  return `/spaces${isSiteAdmin ? '?hidden=false' : ''}`
}

export const ALLOWED_SPACE_GROUP_TYPES = ['groups', 'review', 'government'] as const
export type AllowedSpaceGroupType = (typeof ALLOWED_SPACE_GROUP_TYPES)[number]

export const isAllowedSpaceGroupType = (type: string): type is AllowedSpaceGroupType => {
  return ALLOWED_SPACE_GROUP_TYPES.includes(type as AllowedSpaceGroupType)
}
