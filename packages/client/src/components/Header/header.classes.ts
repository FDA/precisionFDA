import { cn } from '@/utils/cn'

/** Shared hit target + hover fill for header chrome */
const headerChromeInteractive = (active?: boolean) =>
  cn(
    'flex shrink-0 items-center gap-2 rounded-[3px] !px-2 !py-1.5 text-[13px] leading-none',
    'transition-[background-color,color] duration-100 ease-in-out',
    'hover:!bg-app-header-hover hover:!text-white',
    active && 'bg-app-header-hover !text-white',
  )

/**
 * User menu + notifications — header menu tone, not favorites gray.
 * Shared: Header + NotificationCenter.
 */
export const headerDropdownTrigger = (active?: boolean) =>
  cn(headerChromeInteractive(active), '!text-app-header-menu', 'bg-transparent')

/**
 * 16px-tall icon row.
 * Shared: Header + FavoriteMenuItemsScreen.
 */
export const headerIconWrap = (marginBottomSvg?: boolean) =>
  cn('flex h-4 items-center', marginBottomSvg && '[&_svg]:mb-px')
