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
import { DataPortalIcon } from '../icons/DataPortalIcon'
import { PrismIcon } from '../icons/PrismIcon'
import { ToolsIcon } from '../icons/ToolsIcon'
import { GlobeIcon } from '../icons/GlobeIcon'
import { QuestionIcon } from '../icons/QuestionIcon'
import { SUPPORT_EMAIL } from '../../constants'

export type SiteNavItemType = {
  id: string,
  icon: React.JSX.ElementType,
  iconHeight: number,
  text: string,
  alink?: string,
  external: boolean,
} | {
  id: string,
  icon: React.JSX.ElementType,
  iconHeight: number,
  text: string,
  link?: string,
  external: boolean,
} 

export const siteNavItems: SiteNavItemType[] = [
  {
    id: 'overview',
    icon: HomeIcon,
    iconHeight: 17,
    text: 'Overview',
    link: '/',
    external: false,
  },
  {
    id: 'discussions',
    icon: DiscussionIcon,
    iconHeight: 17,
    text: 'Discussions',
    alink: '/discussions',
    external: false,
  },
  {
    id: 'challenges',
    icon: TrophyIcon,
    iconHeight: 17,
    text: 'Challenges',
    link: '/challenges',
    external: false,
  },
  {
    id: 'experts',
    icon: LightBulbIcon,
    iconHeight: 17,
    text: 'Experts',
    link: '/experts',
    external: false,
  },
  {
    id: 'home',
    icon: FortIcon,
    iconHeight: 17,
    text: 'My Home',
    link: '/home',
    external: false,
  },
  {
    id: 'spaces',
    icon: ObjectGroupIcon,
    iconHeight: 17,
    text: 'Spaces',
    link: '/spaces',
    external: false,
  },
  {
    id: 'notes',
    icon: StickyNoteIcon,
    iconHeight: 17,
    text: 'Notes',
    alink: '/notes',
    external: false,
  },
  {
    id: 'comparisons',
    icon: BullsEyeIcon,
    iconHeight: 17,
    text: 'Comparisons',
    alink: '/comparisons',
    external: false,
  },
  {
    id: 'docs',
    icon: BookIcon,
    iconHeight: 17,
    text: 'Documentation',
    link: '/docs',
    external: false,
  },
  {
    id: 'support',
    icon: QuestionIcon,
    iconHeight: 17,
    text: 'Support',
    link: '',
    alink: `mailto:${SUPPORT_EMAIL}`,
    external: true,
  },
  {
    id: 'daaas',
    icon: DataPortalIcon,
    iconHeight: 18,
    text: 'DAaaS',
    link: '/data-portals/daaas',
    external: false,
  },
  {
    id: 'prism',
    icon: PrismIcon,
    iconHeight: 17,
    text: 'PRISM',
    link: '/data-portals/prism',
    external: false,
  },
  {
    id: 'tools',
    icon: ToolsIcon,
    iconHeight: 17,
    text: 'Tools',
    link: '/data-portals/tools',
    external: false,
  },
]

export const gsrsNavItems: SiteNavItemType[] = [
  {
    id: 'gsrs',
    icon: GSRSIcon,
    iconHeight: 17,
    text: 'GSRS',
    link: '',
    alink: '/ginas/app/beta',
    external: true,
  },
]

export const cdmhNavItems: SiteNavItemType[] = [
  {
    id: 'cdmh-portal',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'CDMH Portal',
    link: '#',
    external: true,
  },
  {
    id: 'cdr-browser',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'CDR Browser',
    link: '#',
    external: true,
  },
  {
    id: 'cdr-admin',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'CDR Admin',
    link: '#',
    external: true,
  },
  {
    id: 'connect-portal',
    icon: GlobeIcon,
    iconHeight: 17,
    text: 'Connect Portal',
    link: '#',
    external: true,
  },
]
