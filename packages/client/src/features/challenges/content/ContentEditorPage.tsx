import { Outlet, useParams } from 'react-router'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { useAuthUser } from '../../auth/useAuthUser'
import { ContentEditorSidebar } from './ContentEditorSidebar'

export default function ChallengeContentEditPage() {
  const user = useAuthUser()
  const { challengeId } = useParams<{ challengeId: string }>()

  if (!user?.can_create_challenges) {
    return <NotAllowedPage />
  }

  if (!challengeId) {
    return null
  }

  return (
    <div className="flex h-[calc(100vh-var(--spacing-below-header))] min-h-0 overflow-hidden">
      <SidebarProvider contained className="min-h-0 flex-1">
        <ContentEditorSidebar challengeId={challengeId} />
        <SidebarInset className="min-h-0">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <span className="font-semibold">Content Editor</span>
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
