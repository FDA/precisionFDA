import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toastError } from '../../components/NotificationCenter/ToastHelper'
import { useModal } from '../modal/useModal'
import { unlockSpaceRequest } from './spaces.api'
import type { ISpace } from './spaces.types'

export const useUnlockSpaceModal = ({
  space,
  onSuccess,
}: {
  space: ISpace
  onSuccess?: (isLocked: boolean) => void
}) => {
  const isLocked = space.links.unlock

  const { isShown, setShowModal } = useModal()
  const unlockSpaceMutation = useMutation({
    mutationKey: ['lock-unlock-space'],
    mutationFn: (payload: { id: string; op: 'lock' | 'unlock'; link?: string }) => unlockSpaceRequest(payload),
    onSuccess: () => {
      if (onSuccess) onSuccess(!!isLocked)
      setShowModal(false)
    },
    onError: err => {
      toastError(`Failed to unlock space: ${err}`)
    },
  })
  const handleClose = () => {
    setShowModal(false)
  }

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="unlock-lock-space-modal" data-testid="modal-unlock-lock-space">
        <DialogHeader>
          <DialogTitle>{isLocked ? 'Unlock' : 'Lock'} space</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to {isLocked ? 'unlock' : 'lock'} this space?</p>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={handleClose} disabled={unlockSpaceMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={unlockSpaceMutation.isPending}
            onClick={() =>
              unlockSpaceMutation.mutate({
                id: space.id.toString(),
                op: isLocked ? 'lock' : 'unlock',
                link: space.links.lock ? space.links.lock : space.links.unlock,
              })
            }
          >
            {isLocked ? 'Unlock' : 'Lock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
