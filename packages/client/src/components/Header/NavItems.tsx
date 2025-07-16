import { HomeIcon } from '../icons/HomeIcon'
import { GSRSIcon } from '../icons/GSRSIcon'
import { DiscussionIcon } from '../icons/DiscussionIcon'
import { TrophyIcon } from '../icons/TrophyIcon'
import { LightBulbIcon } from '../icons/LightBulbIcon'
import { FortIcon } from '../icons/FortIcon'
import { ObjectGroupIcon } from '../icons/ObjectGroupIcon'
import { StickyNoteIcon } from '../icons/StickyNote'
import { BullsEyeIcon } from '../icons/BullsEyeIcon'
import { BookIcon } from '../icons/BookIcon'
import { DaaasPortalIcon } from '../icons/DaaasPortalIcon'
import { AdministrationPortalIcon } from '../icons/AdministrationPortalIcon'
import { PrismPortalIcon } from '../icons/PrismPortalIcon'
import { ToolsPortalIcon } from '../icons/ToolsPortalIcon'
import { GlobeIcon } from '../icons/GlobeIcon'
import { QuestionIcon } from '../icons/QuestionIcon'
import { PFDA_EMAIL } from '../../constants'
import { DataPortalIcon } from '../icons/DataPortalIcon'


export const getNavigationPath = (navItem: SiteNavItemType): string => {
  switch (navItem.navigation.type) {
    case 'internal':
      return navItem.navigation.path
    case 'external':
      return navItem.navigation.url
    case 'mailto':
      return `mailto:${navItem.navigation.email}`
    default:
      return '#'
  }
}

export const getNavigationTarget = (navItem: SiteNavItemType): string | undefined => {
  return (navItem.navigation.type === 'external' || navItem.navigation.type === 'mailto') ? '_blank' : undefined
}

export const getNavigationRel = (navItem: SiteNavItemType): string | undefined => {
  return navItem.navigation.type === 'mailto' ? 'noreferrer' : undefined
}

/**
 * Defining different navigation targets:
 * - internal: React Router Link navigation within the app
 * - external: External URL opened in new tab
 * - mailto: Email link that opens user's default email client
 */
export type NavigationTarget = 
  | { type: 'internal'; path: string }
  | { type: 'external'; url: string }
  | { type: 'mailto'; email: string }

export type SiteNavItemType = {
  id: string
  icon: React.JSX.ElementType
  iconHeight: number
  text: string
  navigation: NavigationTarget
}

export const siteNavItems: SiteNavItemType[] = [
  {
    id: 'overview',
    icon: HomeIcon,
    iconHeight: 17,
    text: 'Overview',
    navigation: { type: 'internal', path: '/' },
  },
  {
    id: 'data-portals',
    icon: DataPortalIcon,
    iconHeight: 17,
    text: 'Data-Portals',
    navigation: { type: 'internal', path: '/data-portals' },
  },
  {
    id: 'discussions',
    icon: DiscussionIcon,
    iconHeight: 17,
    text: 'Discussions',
    navigation: { type: 'internal', path: '/home/discussions?scope=everybody' },
  },
  {
    id: 'challenges',
    icon: TrophyIcon,
    iconHeight: 17,
    text: 'Challenges',
    navigation: { type: 'internal', path: '/challenges' },
  },
  {
    id: 'experts',
    icon: LightBulbIcon,
    iconHeight: 17,
    text: 'Experts',
    navigation: { type: 'internal', path: '/experts' },
  },
  {
    id: 'home',
    icon: FortIcon,
    iconHeight: 17,
    text: 'My Home',
    navigation: { type: 'internal', path: '/home' },
  },
  {
    id: 'spaces',
    icon: ObjectGroupIcon,
    iconHeight: 17,
    text: 'Spaces',
    navigation: { type: 'internal', path: '/spaces' },
  },
  {
    id: 'notes',
    icon: StickyNoteIcon,
    iconHeight: 17,
    text: 'Notes',
    navigation: { type: 'external', url: '/notes' },
  },
  {
    id: 'comparisons',
    icon: BullsEyeIcon,
    iconHeight: 17,
    text: 'Comparisons',
    navigation: { type: 'external', url: '/comparisons' },
  },
  {
    id: 'docs',
    icon: BookIcon,
    iconHeight: 17,
    text: 'Documentation',
    navigation: { type: 'external', url: '/docs' },
  },
  {
    id: 'support',
    icon: QuestionIcon,
    iconHeight: 17,
    text: 'Support',
    navigation: { type: 'mailto', email: PFDA_EMAIL },
  },
  {
    id: 'daaas',
    icon: DaaasPortalIcon,
    iconHeight: 18,
    text: 'DAaaS',
    navigation: { type: 'internal', path: '/data-portals/daaas' },
  },
  {
    id: 'prism',
    icon: PrismPortalIcon,
    iconHeight: 17,
    text: 'PRISM',
    navigation: { type: 'internal', path: '/data-portals/prism' },
  },
  {
    id: 'tools',
    icon: ToolsPortalIcon,
    iconHeight: 17,
    text: 'Tools',
    navigation: { type: 'internal', path: '/data-portals/tools' },
  },
  {
    id: 'precisionfda-system-administration-portal',
    icon: AdministrationPortalIcon,
    iconHeight: 17,
    text: 'Admin',
    navigation: { type: 'internal', path: '/data-portals/precisionfda-system-administration-portal' },
  },
]

export const gsrsNavItems: SiteNavItemType[] = [
  {
    id: 'gsrs',
    icon: GSRSIcon,
    iconHeight: 17,
    text: 'GSRS',
    navigation: { type: 'external', url: '/ginas/app/ui' },
  },
]

export const cdmhNavItems: SiteNavItemType[] = [
  {
    id: 'cdmh-portal',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'CDMH Portal',
    navigation: { type: 'external', url: '#' },
  },
  {
    id: 'cdr-browser',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'CDR Browser',
    navigation: { type: 'external', url: '#' },
  },
  {
    id: 'cdr-admin',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'CDR Admin',
    navigation: { type: 'external', url: '#' },
  },
  {
    id: 'connect-portal',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'Connect Portal',
    navigation: { type: 'external', url: '#' },
  },
]
