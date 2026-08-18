import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { SiteLogo } from '@/components/SiteLogo'

/**
 * Shared layout configurations
 *
 * The docs layout that consumes these options lives in app/(home)/layout.tsx.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <SiteLogo />,
    url: 'https://precision.fda.gov',
  },
}
