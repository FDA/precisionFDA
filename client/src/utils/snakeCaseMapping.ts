// TODO(samuel) temporary solution until template type generic is implemented

import { FlipKeysAndValues } from './generics'

export const snakeToCamelMapping = {
  can_access_notification_preference: 'canAccessNotificationPreference',
  can_administer_site: 'canAdministerSite',
  can_create_challenges: 'canCreateChallenges',
  can_see_spaces: 'canSeeSpaces',
  current_page: 'currentPage',
  first_name: 'firstName',
  full_name: 'fullName',
  gravatar_url: 'gravatarUrl',
  is_guest: 'isGuest',
  last_name: 'lastName',
  next_page: 'nextPage',
  order_by: 'orderBy',
  order_dir: 'orderDir',
  page: 'page',
  per_page: 'perPage',
  prev_page: 'prevPage',
  total_pages: 'totalPages',
  total_count: 'totalCount',
} as const

export const camelToSnakeMapping = Object.fromEntries(
  Object.entries(snakeToCamelMapping).map(([key, value]) => [value, key]),
) as FlipKeysAndValues<typeof snakeToCamelMapping>
