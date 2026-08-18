import { useQuery } from '@tanstack/react-query'
import type { RowSelectionState } from '@tanstack/react-table'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useProvisionMutation } from '@/api/mutations/invitation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'
import { pluralize } from '@/utils/formatting'
import { useModal } from '../../../modal/useModal'
import { fetchFDAPortals, type Invitation } from '../../users/api'

const EMPTY_SPACES: { id: number; name: string }[] = []

const ProvisioningModal = ({
  invitations,
  handleClose,
  setSelectedIndexes,
}: {
  invitations: Invitation[]
  handleClose: () => void
  setSelectedIndexes: React.Dispatch<React.SetStateAction<RowSelectionState>>
}) => {
  const [selectedSpaces, setSelectedSpaces] = useState<Set<number>>(new Set())

  const { data: spaces = EMPTY_SPACES, isLoading } = useQuery({
    queryKey: ['fda-space-group'],
    queryFn: fetchFDAPortals,
  })

  // preselect all portals once loaded
  useEffect(() => {
    setSelectedSpaces(new Set(spaces.map(({ id }) => id)))
  }, [spaces])

  const provisionMutation = useProvisionMutation({
    invitations,
    selectedSpaces,
    onSuccess: () => setSelectedIndexes({}),
  })

  const handleSpaceToggle = (spaceId: number) => {
    setSelectedSpaces(prev => {
      const newSet = new Set(prev)
      newSet.has(spaceId) ? newSet.delete(spaceId) : newSet.add(spaceId)
      return newSet
    })
  }

  const handleSelectAll = () => setSelectedSpaces(new Set(spaces.map(({ id }) => id)))
  const handleUnselectAll = () => setSelectedSpaces(new Set())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    provisionMutation.mutate()
  }

  const isSubmitting = provisionMutation.isPending

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16" role="status" aria-label="Loading FDA portals">
        <div className="size-10 animate-spin rounded-full border-3 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <form id="edit-provision-form" className="flex h-full flex-col" onSubmit={handleSubmit}>
          <p className="mb-4 text-sm text-(--warning-500)">
            This selection only applies to users with FDA email domains (fda.hhs.gov, fda.gov).
          </p>
          <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border bg-background p-3 shadow-xs">
            <span className="text-sm font-semibold text-foreground">
              {selectedSpaces.size} of {spaces.length} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" type="button" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={handleUnselectAll}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3">
            {spaces.map(space => (
              <label
                key={space.id}
                htmlFor={`provision-space-${space.id}`}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border-2 bg-background p-4 transition-colors hover:border-muted-foreground/40',
                  selectedSpaces.has(space.id) && 'border-primary hover:border-primary',
                )}
              >
                <Checkbox
                  id={`provision-space-${space.id}`}
                  checked={selectedSpaces.has(space.id)}
                  onCheckedChange={() => handleSpaceToggle(space.id)}
                  disabled={isSubmitting}
                />
                <span className="flex-1 text-sm font-medium">{space.name}</span>
              </label>
            ))}
          </div>
        </form>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" form="edit-provision-form" disabled={isSubmitting}>
          {isSubmitting
            ? 'Provisioning...'
            : `Provision ${invitations.length} ${pluralize('User', invitations.length)}`}
        </Button>
      </DialogFooter>
    </>
  )
}

export const useProvisioningModal = (
  invitations: Invitation[],
  setSelectedIndexes: React.Dispatch<React.SetStateAction<RowSelectionState>>,
) => {
  const { isShown, setShowModal } = useModal()
  const handleClose = () => {
    setShowModal(false)
  }

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="modal-provisioning"
        data-testid="modal-provisioning"
        variant="large"
        className="grid grid-rows-[auto_minmax(0,1fr)_auto] gap-4"
      >
        <DialogHeader>
          <DialogTitle>Provision Users - FDA Portals Selection</DialogTitle>
        </DialogHeader>
        <ProvisioningModal
          invitations={invitations}
          handleClose={handleClose}
          setSelectedIndexes={setSelectedIndexes}
        />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
