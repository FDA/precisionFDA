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
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => blocker.reset?.()}>
          Stay on page
        </Button>
        <Button variant="destructive" onClick={() => blocker.proceed?.()}>
          Leave page
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
