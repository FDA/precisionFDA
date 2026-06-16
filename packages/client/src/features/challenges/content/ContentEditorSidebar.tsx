import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, ClipboardList, ExternalLink, FileText, FolderOpen, PenLine, Trophy } from 'lucide-react'
import { NavLink, useMatch } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useChallengeByIDQuery } from '../useChallengeDetailsQuery'

function SidebarNavMenuItem({
  to,
  matchPath,
  end,
  icon: Icon,
  label,
}: {
  to: string
  matchPath: string
  end?: boolean
  icon: LucideIcon
  label: string
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive = !!useMatch({ path: matchPath, end: end ?? false })

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className="text-(--c-text-600)! no-underline visited:text-(--c-text-600)! hover:text-(--c-text-700)! data-[active=true]:bg-background-shaded! data-[active=true]:font-medium data-[active=true]:text-(--c-text-700)!"
        render={
          <NavLink
            to={to}
            end={end}
            onClick={() => {
              if (isMobile) setOpenMobile(false)
            }}
          />
        }
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export const ContentEditorSidebar = ({ challengeId }: { challengeId: string }) => {
  const { data: challenge } = useChallengeByIDQuery(challengeId)
  const { isMobile, setOpenMobile } = useSidebar()

  const contentPages = [
    {
      to: `/challenges/${challengeId}/content/info`,
      matchPath: '/challenges/:challengeId/content/info',
      icon: FileText,
      label: 'Challenge Info',
    },
    {
      to: `/challenges/${challengeId}/content/results`,
      matchPath: '/challenges/:challengeId/content/results',
      icon: Trophy,
      label: 'Challenge Results',
    },
    {
      to: `/challenges/${challengeId}/content/pre-registration`,
      matchPath: '/challenges/:challengeId/content/pre-registration',
      icon: ClipboardList,
      label: 'Pre-Registration',
    },
  ]

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <PenLine className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{challenge?.name ?? 'Challenge'}</p>
            <p className="text-xs text-sidebar-foreground/70">Content Editor</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavMenuItem
                to={`/challenges/${challengeId}`}
                matchPath="/challenges/:challengeId"
                end
                icon={ArrowLeft}
                label="Back to Challenge"
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentPages.map(item => (
                <SidebarNavMenuItem
                  key={item.to}
                  to={item.to}
                  matchPath={item.matchPath}
                  end
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-(--c-text-600)! no-underline visited:text-(--c-text-600)! hover:text-(--c-text-700)!"
                  render={
                    <a
                      href={`/challenges/${challengeId}/editor/resources`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-turbolinks="false"
                      onClick={() => {
                        if (isMobile) setOpenMobile(false)
                      }}
                    >
                      <FolderOpen />
                      <span>Resources</span>
                      <ExternalLink className="ml-auto size-3 opacity-50" />
                    </a>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
