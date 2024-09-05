import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { UseMutationResult, useQuery } from '@tanstack/react-query'
import { Column } from 'react-table'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { EmptyTable } from '../../components/Table/styles'
import Table from '../../components/Table/Table'
import { getSelectedObjectsFromIndexes } from '../../utils/object'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { IApp } from '../apps/apps.types'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Button } from '../../components/Button'

const StyledName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const StyledLoader = styled.div`
  padding: 12px;
`

type ResourceTypes = 'apps' | 'workflows'

async function fetchResourceListRequest(resource: ResourceTypes): Promise<any> {
  return axios
    .post(`/api/list_${resource}`, {
      scopes: ['private'],
    })
    .then(res => res.data)
}

const ResourceTable = ({
  resource,
  setSelectedUids,
}: {
  resource: ResourceTypes
  setSelectedUids: (a: string[]) => void
}) => {
  const [selected, setSelected] = useState<Record<string, boolean> | undefined>(
    {},
  )
  const { data, isLoading } = useQuery({
    queryKey: ['resource_list', resource],
    queryFn: () => fetchResourceListRequest(resource).catch(() => toast.error('Error: Fetching resource data list')),
  })
  const col: Column[] = [
    {
      Header: 'Name',
      accessor: 'name',
      minWidth: 450,
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: ({ value }) => <StyledName>{value}</StyledName>,
    },
    {
      Header: 'Revision',
      accessor: 'revision',
      minWidth: 80,
      maxWidth: 80,
    },
  ]

  useEffect(() => {
    const uids = getSelectedObjectsFromIndexes(selected, data).map(i => i.uid)
    setSelectedUids(uids)
  }, [selected])
  const columns = useMemo(() => col, [col])
  const d = useMemo(() => data, [data])

  if (isLoading) return <StyledLoader>Loading....</StyledLoader>

  return (
    <Table<IApp>
      displayColFiller={false}
      name="apps"
      columns={columns as any}
      data={d as any}
      isSelectable
      loading={isLoading}
      loadingComponent={<div>Loading...</div>}
      selectedRows={selected}
      setSelectedRows={setSelected}
      emptyComponent={<EmptyTable>You have no {resource} in My Home.</EmptyTable>}
    />
  )
}

export function useAddResourceToModal({
  spaceId,
  resource,
  mutation,
  onSuccess,
}: {
  spaceId: string
  resource: ResourceTypes
  mutation?: UseMutationResult<
    any,
    unknown,
    {
      spaceId: string
      uids: string[]
    },
    unknown
  >
  onSuccess: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const [selectedUids, setSelectedUids] = useState<string[]>([])

  const handleSubmit = (e: any) => {
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
      <ModalHeaderTop
        disableClose={false}
        headerText={`Add ${resource} to space`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <ResourceTable resource={resource} setSelectedUids={setSelectedUids} />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation?.isPending && <Loader height={14} />}
          <Button
            onClick={() => setShowModal(false)}
            disabled={mutation?.isPending}
          >
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
