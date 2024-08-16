import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { CircleCheckIcon } from '../../components/icons/CircleCheckIcon'
import { ResourceTable, StyledName } from '../../components/ResourceTable'
import { theme } from '../../styles/theme'
import { EmptyTable } from '../../components/Table/styles'
import { useModal } from '../modal/useModal'
import { FileLicense } from '../assets/assets.types'
import { APIResource } from '../home/types'
import { attachLicenseRequest, fetchLicensesList } from './api'
import { License } from './types'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { Button } from '../../components/Button'

const HiddenElement = styled.div`
  width: 16px;
  height: 16px;
`

const StyledAction = styled.div<{ isCurrent: boolean }>`
  color: ${theme.colors.primaryBlue};
`

const ScrollWrapper = styled(ModalScroll)`
  padding-left: 12px;
  padding-bottom: 12px;
`

export function useAttachLicensesModal<
  T extends { uid?: string; dxid?: string; file_license?: FileLicense },
>({
  selected,
  resource,
  onSuccess,
}: {
  selected: T
  resource: APIResource
  onSuccess?: (res: any) => void
}) {
  const selectedId = selected?.uid || selected?.dxid
  const { isShown, setShowModal } = useModal()
  const queryClient = useQueryClient()
  const [selectedLicense, setSelectedLicenses] = useState<string | undefined>()
  useEffect(() => {
    setSelectedLicenses(selected?.file_license?.id)
  }, [selected])
  const { data } = useQuery({
    queryKey: ['licenses'],
    queryFn: fetchLicensesList,
  })

  const resetSelected = () => {
    setSelectedLicenses(undefined)
  }

  const handleClose = () => {
    resetSelected()
    setShowModal(false)
  }

  const handleClickLicense = (s: License) => {
    setSelectedLicenses(s.id)
  }

  const licenses = data?.licenses
  const mutation = useMutation({
    mutationKey: ['attach-license', resource],
    mutationFn: ({ dxid, licenseId }: { dxid: string; licenseId: string }) => {
      return attachLicenseRequest({ dxid, licenseId })
    },
    onError: () => {
      toast.error('Error: Attaching licenses')
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({
        queryKey: ['licenses'],
      })
      if (onSuccess) onSuccess(res)
      resetSelected()
      setShowModal(false)
      toast.success('Success: Attaching Licenses')
    },
  })

  const handleSubmit = (selectedLicenseId?: string) => {
    selectedId &&
      selectedLicenseId &&
      mutation.mutateAsync({ dxid: selectedId, licenseId: selectedLicenseId })
  }

  const modalComp = (
    <ModalNext
      id="modal-licenses-attach"
      data-testid="modal-licenses-attach"
      headerText="Select a license"
      isShown={isShown}
      hide={handleClose}
    >
      <ModalHeaderTop
        headerText="Select a license"
        hide={() => setShowModal(false)}
      />
      {licenses && (
        <ScrollWrapper>
          <>
            {licenses.length === 0 ? (
              <EmptyTable>You don&apos;t have any licenses.</EmptyTable>
            ) : (
              <ResourceTable
                rows={licenses.map((s, i) => {
                  const isCurrent = selectedLicense === s.id
                  return {
                    title: (
                      <StyledName
                        as="div"
                        key={`${i}-name`}
                        onClick={() => handleClickLicense(s)}
                        isCurrent={isCurrent}
                      >
                        {s.title}
                      </StyledName>
                    ),
                    action: (
                      <StyledAction
                        key={`${i.id}-action`}
                        onClick={() => handleClickLicense(s)}
                        isCurrent={isCurrent}
                      >
                        {isCurrent ? <CircleCheckIcon /> : <HiddenElement />}
                      </StyledAction>
                    ),
                  }
                })}
              />
            )}
            {mutation.isError && mutation.error}
          </>
        </ScrollWrapper>
      )}
      <Footer>
        <ButtonRow>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            data-variant="primary"
            onClick={() => handleSubmit(selectedLicense)}
            disabled={
              !selectedLicense || selectedLicense === selected?.file_license?.id
            }
          >
            Attach
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
