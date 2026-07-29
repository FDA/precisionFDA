import { useMutation, useQuery } from '@tanstack/react-query'
import { CircleCheckIcon, TrophyIcon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Loader } from '../../components/Loader'
import { toastError } from '../../components/NotificationCenter/ToastHelper'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { displayPayloadMessage, type Payload } from '../../utils/api'
import type { APIResource } from '../home/types'
import { useModal } from '../modal/useModal'
import { assignToChallengeRequest, fetchApp } from './apps.api'
import type { IApp } from './apps.types'

const ChallengesList = ({
  selected,
  appUid,
  onSelect,
}: {
  selected?: string
  appUid: string
  onSelect: (scope: string) => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['app', appUid],
    queryFn: () => fetchApp(appUid),
  })
  const meta = data?.meta
  const challenges = meta?.challenges ?? []
  if (isLoading)
    return (
      <div className="flex items-center gap-2 p-3 text-muted-foreground">
        <Loader height={14} />
        Loading...
      </div>
    )
  if (challenges.length === 0) return <div className="p-3 text-muted-foreground">No challenges yet.</div>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead sticky>Challenge</TableHead>
          <TableHead sticky className="w-10 text-right">
            <span className="sr-only">Selected</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {challenges.map((s, i) => (
          <TableRow
            aria-selected={selected === s.id.toString()}
            className="cursor-pointer aria-selected:bg-muted"
            key={i}
            onClick={() => onSelect(s.id.toString())}
          >
            <TableCell className="whitespace-normal">
              <div className="flex items-center gap-2 text-foreground">
                <TrophyIcon className="size-3.5 shrink-0 text-muted-foreground" />
                {s.name}
              </div>
            </TableCell>
            <TableCell className="text-right">
              {selected === s.id.toString() ? (
                <CircleCheckIcon className="ml-auto size-5 text-primary-foreground [&_circle]:fill-primary [&_circle]:stroke-primary [&_path]:stroke-primary-foreground" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const ChallengeAppForm = ({
  app,
  setShowModal,
  onSuccess,
}: {
  resource: APIResource
  app: IApp
  setShowModal: (show: boolean) => void
  onSuccess?: (res: unknown) => void
}) => {
  const [selectedId, setSelectedId] = useState<string>()

  const mutation = useMutation({
    mutationKey: ['challenge-app-form'],
    mutationFn: assignToChallengeRequest,
    onSuccess: res => {
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      displayPayloadMessage(res as Payload)
    },
    onError: error => {
      toastError(error.message)
    },
  })

  const handleSelect = (f: string) => {
    if (f === selectedId) {
      setSelectedId(undefined)
    } else {
      setSelectedId(f)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedId) {
      mutation.mutateAsync({
        link: '/api/assign_app',
        appId: app.id,
        challengeId: selectedId,
      })
    }
  }
  return (
    <>
      <div className="max-h-(--modal-max-height,50vh) min-w-[min(300px,100%)] flex-1 overflow-auto pb-3 **:data-[slot=table-container]:overflow-visible">
        <form id="attach-to-challenge-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <ChallengesList appUid={app.uid} selected={selectedId} onSelect={handleSelect} />
        </form>
      </div>
      <DialogFooter>
        {mutation.isPending && <Loader height={14} />}
        <Button variant="outline" onClick={() => setShowModal(false)} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" form="attach-to-challenge-form" disabled={!selectedId || mutation.isPending}>
          Assign
        </Button>
      </DialogFooter>
    </>
  )
}

export function useAttachToChallengeModal({
  resource,
  selected,
  onSuccess,
}: {
  resource: APIResource
  selected: IApp
  onSuccess?: (res: unknown) => void
}) {
  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="attach-to-challenge-modal"
        data-testid={`modal-${resource}-attach-to-challenge`}
        variant="medium"
      >
        <DialogHeader>
          <DialogTitle>Assign to challenge</DialogTitle>
        </DialogHeader>
        <ChallengeAppForm resource={resource} app={selected} setShowModal={setShowModal} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
