import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useModal } from '@/features/modal/useModal'
import { cn } from '@/utils/cn'
import { FavoriteMenuItemsScreen } from './FavoriteMenuItemsScreen'

/** Edit favorites modal shell — @theme tokens from tailwind.css */
const editFavoritesModalContainer = 'flex h-full max-h-full min-h-0 flex-col overflow-hidden rounded-xl'

const editFavoritesModalHeader = cn('flex items-start border-b border-border px-6 pt-6 pr-14 pb-4 max-md:pr-12')

const editFavoritesModalHeaderContent = 'min-w-0 flex-1'

const editFavoritesModalTitle = cn('mb-2 mt-0 text-2xl font-bold tracking-tight text-foreground')

const editFavoritesModalSubtitle = cn('m-0 text-sm leading-normal text-muted-foreground')

const editFavoritesModalContent = 'min-h-0 flex-1 overflow-y-auto p-6'

export function useEditFavoritesModal() {
  const { isShown, setShowModal } = useModal()
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={open => !open && handleClose()}>
      <DialogContent
        id="edit-navigation"
        data-testid="edit-navigation"
        showCloseButton
        className="flex max-h-[90vh] w-[min(400px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <div className={editFavoritesModalContainer}>
          <div className={editFavoritesModalHeader}>
            <div className={editFavoritesModalHeaderContent}>
              <DialogTitle className={editFavoritesModalTitle}>Customize Navigation & Favorites</DialogTitle>
              <DialogDescription className={editFavoritesModalSubtitle}>
                Drag and drop items to reorder or click to favorite.
              </DialogDescription>
            </div>
          </div>
          <div className={editFavoritesModalContent}>
            <FavoriteMenuItemsScreen />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
