import type { useBlocker } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Blocker = ReturnType<typeof useBlocker>

export const NavigationBlockerDialog = ({
  blocker,
  message = 'There are unsaved changes, are you sure you want to leave?',
}: {
  blocker: Blocker
  message?: string
}) => (
  <Dialog open={blocker.state === 'blocked'}>
    <DialogContent showCloseButton={false} className="gap-4">
      <DialogHeader className="border-b-0 pb-0">
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogDescription className="font-normal">{message}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => blocker.reset?.()}>
          Stay on page
        </Button>
        <Button onClick={() => blocker.proceed?.()}>Leave page</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
