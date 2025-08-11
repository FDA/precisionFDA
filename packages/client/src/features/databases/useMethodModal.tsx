import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import { ResourceTable } from '../../components/ResourceTable'
import { pluralize } from '../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Content, Footer } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { databaseMethodRequest } from './databases.api'
import { MethodType } from './databases.types'

const ResourceTableContainer = styled.div`
  margin-bottom: 20px;
  padding: 1rem;
`

const InfoText = styled.div`
  margin-top: 20px;

  p {
    margin-bottom: 10px;
  }
`

const FooterInfo = styled.p`
  margin-right: auto;
  padding-left: 8px;
`

const getVerb = (method: MethodType) => {
  switch (method) {
    case 'start':
      return 'Starting'
    case 'stop':
      return 'Stopping'
    case 'terminate':
      return 'Terminating'
  }
}

export function useMethodModal<T extends { dxid: string; name: string; location?: string }>({
  method,
  selected,
  onSuccess,
}: {
  method: MethodType
  selected: T[]
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const dxids = momoSelected.map(s => s.dxid)
  const mutation = useMutation({
    mutationKey: ['database-method'],
    mutationFn: (ids: string[]) => databaseMethodRequest(method, ids),
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['dbclusters'],
      })
      toast.error(`${getVerb(method)} the database failed`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dbclusters'],
      })
      if (onSuccess) onSuccess()
      setShowModal(false)
      toast.success(`${getVerb(method)} database. This may take a moment`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(dxids)
  }
  const methodText = method.charAt(0).toUpperCase() + method.slice(1)

  const modalComp = (
    <ModalNext
      data-testid="modal-dbcluster-method"
      headerText={`${methodText} ${momoSelected.length} ${pluralize('item', momoSelected.length)}`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
      id="method-modal"
    >
      <ModalHeaderTop
        headerText={`${methodText} ${momoSelected.length} ${pluralize('item', momoSelected.length)}`}
        hide={() => setShowModal(false)}
      />
      <ResourceTableContainer>
        <ResourceTable
          rows={selected.map(s => {
            return {
              name: <div>{s.name}</div>,
              location: <div>{s.location || ''}</div>,
            }
          })}
        />
      </ResourceTableContainer>
      {method === 'stop' ? (
        <Content>
          <InfoText>
            <p>
              This database cluster will be stopped. After seven days, the database cluster will automatically re-activate and
              begin incurring charges. If you do not wish to keep this database cluster, use the Terminate action to permanently
              stop it and delete its contents.
            </p>
          </InfoText>
        </Content>
      ) : null}
      <Footer>
        <>
          {method === 'stop' ? (
            <FooterInfo>
              By clicking the &#34;Stop&#34; button, you acknowledge and accept this automatic restart behavior.
            </FooterInfo>
          ) : null}
          <ButtonRow>
            {mutation.isPending && <Loader />}
            <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button data-variant="primary" onClick={handleSubmit} disabled={mutation.isPending}>
              {methodText}
            </Button>
          </ButtonRow>
        </>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
