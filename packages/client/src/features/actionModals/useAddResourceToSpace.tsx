import { UseMutationResult, useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import React, { MouseEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import Table from '../../components/Table'
import { selectColumnDef } from '../../components/Table/selectColumnDef'
import { getSelectedObjectsFromIndexes } from '../../utils/object'
import { useListSelect } from '../home/useListSelect'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { Empty } from '../home/home.styles'

const StyledName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

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
      cell: c => <StyledName>{c.row.original.name}</StyledName>,
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
  if(error) toast.error('Fetching resource data list')
  if(isLoading) return <div className="p-4"><Loader /></div>
  if(!data) return <Empty>There are no resources here</Empty>

  return <Table<T> enableColumnFilters={false} isLoading={isLoading} columns={col} data={data} rowSelection={selectedIndexes} setSelectedRows={setSelectedIndexes} />
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
    <ModalNext
      id="add-resource-to-space"
      data-testid={`modal-${resource}-add-resource`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop disableClose={false} headerText={`Add ${resource} to space`} hide={() => setShowModal(false)} />
      <ModalScroll>
        <ResourceTable resource={resource} setSelectedUids={setSelectedUids} />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation?.isPending && <Loader height={14} />}
          <Button onClick={() => setShowModal(false)} disabled={mutation?.isPending}>
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedUids.length || mutation?.isPending}
          >
            Add to Space
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
