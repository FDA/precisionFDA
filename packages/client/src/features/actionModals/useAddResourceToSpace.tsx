import { type UseMutationResult, useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import { type MouseEvent, useEffect, useState } from 'react'
import { Loader } from '../../components/Loader'
import { toastError } from '../../components/NotificationCenter/ToastHelper'
import Table from '../../components/Table'
import { selectColumnDef } from '../../components/Table/selectColumnDef'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { getSelectedObjectsFromIndexes } from '../../utils/object'
import { useListSelect } from '../home/useListSelect'
import { useModal } from '../modal/useModal'

type ResourceTypes = 'apps' | 'workflows'

async function fetchResourceListRequest<T>(resource: ResourceTypes) {
  return axios
    .post(`/api/list_${resource}`, {
      scopes: ['private'],
    })
    .then(res => res.data as T[])
}

function ResourceTable<T extends { id: number; uid: string; name: string; revision: number }>({
  resource,
  setSelectedUids,
}: {
  resource: ResourceTypes
  setSelectedUids: (a: string[]) => void
}) {
  const { selectedIndexes, setSelectedIndexes } = useListSelect()
  const { data, isLoading, error } = useQuery({
    queryKey: ['resource_list', resource],
    queryFn: () => fetchResourceListRequest<T>(resource),
  })
  const col: ColumnDef<T>[] = [
    selectColumnDef<T>(),
    {
      header: 'Name',
      accessorKey: 'name',
      size: 250,
      enableColumnFilter: false,
      enableSorting: false,
      enableResizing: false,
      cell: c => <div className="overflow-hidden text-ellipsis whitespace-nowrap">{c.row.original.name}</div>,
    },
    {
      header: 'Revision',
      accessorKey: 'revision',
      enableColumnFilter: false,
      enableSorting: false,
      enableResizing: false,
      size: 200,
    },
  ]

  useEffect(() => {
    const uids = getSelectedObjectsFromIndexes(selectedIndexes, data).map(i => i.uid)
    setSelectedUids(uids)
  }, [selectedIndexes])
  if (error) toastError('Fetching resource data list')
  if (isLoading)
    return (
      <div className="p-4">
        <Loader />
      </div>
    )
  if (!data) return <div className="p-4 text-center text-muted-foreground text-sm">There are no resources here</div>

  return (
    <Table<T>
      enableColumnFilters={false}
      enableColumnSelect={false}
      enableRowClickSelection={true}
      isLoading={isLoading}
      columns={col}
      data={data}
      rowSelection={selectedIndexes}
      setSelectedRows={setSelectedIndexes}
    />
  )
}

export function useAddResourceToModal({
  spaceId,
  resource,
  mutation,
  onSuccess,
}: {
  spaceId?: string
  resource: ResourceTypes
  mutation?: UseMutationResult<
    unknown,
    unknown,
    {
      spaceId?: string
      uids: string[]
    },
    unknown
  >
  onSuccess: (res: unknown) => void
}) {
  const { isShown, setShowModal } = useModal()
  const [selectedUids, setSelectedUids] = useState<string[]>([])

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault()
    if (mutation && selectedUids) {
      mutation.mutateAsync({ spaceId, uids: selectedUids }).then(onSuccess)
    }
  }

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="add-resource-to-space"
        data-testid={`modal-${resource}-add-resource`}
        variant="medium"
        className="min-w-0 gap-4 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>{`Add ${resource} to space`}</DialogTitle>
        </DialogHeader>
        <div className="max-h-(--modal-max-height,50vh) min-h-0 overflow-y-auto">
          <ResourceTable resource={resource} setSelectedUids={setSelectedUids} />
        </div>
        <DialogFooter className="items-center">
          {mutation?.isPending && <Loader height={14} />}
          <Button variant="outline" onClick={() => setShowModal(false)} disabled={mutation?.isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!selectedUids.length || mutation?.isPending}>
            Add to Space
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
