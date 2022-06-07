import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { CircleCheckIcon } from '../../../components/icons/CircleCheckIcon'
import { ResourceTable, StyledName } from '../../../components/ResourceTable'
import { theme } from '../../../styles/theme'
import { Modal } from '../../modal'
import { useModal } from '../../modal/useModal'
import { FileLicense } from '../assets/assets.types'
import { APIResource } from '../types'
import { attachLicenseRequest, fetchLicensesList } from './api'
import { License } from './types'

const HiddenElement = styled.div`
  width: 16px;
  height: 16px;
`

const StyledAction = styled.div<{ isCurrent: boolean }>`
  color: ${theme.colors.primaryBlue};
`

const ScrollWrapper = styled.div`
  overflow-y: scroll;
  max-height: 500px;
`

export function useAttachLicensesModal<
  T extends { uid?: string; dxid?: string, file_license?: FileLicense },
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
  const { data, status, refetch } = useQuery(['licenses'], () =>
    fetchLicensesList(),
  )

  const licenses = data?.licenses
  const mutation = useMutation({
    mutationFn: ({ dxid, licenseId }: { dxid: string; licenseId: string }) => {
      return attachLicenseRequest({ dxid, licenseId })
    },
    onError: () => {
      toast.error('Error: Attaching licenses')
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries('licenses')
      onSuccess && onSuccess(res)
      resetSelected()
      setShowModal(false)
      toast.success('Success: Attaching Licenses')
    },
  })

  const handleSubmit = (selectedLicenseId?: string) => {
    selectedId && selectedLicenseId && 
      mutation.mutateAsync({ dxid: selectedId, licenseId: selectedLicenseId })
  }

  const handleClose = () => {
    resetSelected()
    setShowModal(false)
  }

  const resetSelected = () => {
    setSelectedLicenses(undefined)
  }

  const handleClickLicense = (s: License) => {
    setSelectedLicenses(s.id)
  }

  const modalComp = (
    <Modal
      data-testid="modal-licenses-attach"
      headerText={`Select a license`}
      isShown={isShown}
      hide={handleClose}
      footer={
        <>
          <Button onClick={handleClose}>Cancel</Button>
          <ButtonSolidBlue
            onClick={() => handleSubmit(selectedLicense)}
            disabled={!Boolean(selectedLicense) || selectedLicense === selected?.file_license?.id}
          >
            Attach
          </ButtonSolidBlue>
        </>
      }
    >
      {licenses && (
        <ScrollWrapper>
          {licenses.length === 0 && <div>You do not have any licenses.</div>}
          <ResourceTable
            rows={licenses.map((s, i) => {
              const isCurrent = selectedLicense === s.id
              return {
                title: (
                  <StyledName
                    as={'div'}
                    key={`${i}-name`}
                    onClick={() => handleClickLicense(s)}
                    isCurrent={isCurrent}
                  >
                    {s.title}
                  </StyledName>
                ),
                action: (
                  <StyledAction
                    key={`${i}-action`}
                    onClick={() => handleClickLicense(s)}
                    isCurrent={isCurrent}
                  >
                    {isCurrent ? <CircleCheckIcon /> : <HiddenElement />}
                  </StyledAction>
                ),
              }
            })}
          />
          {mutation.isError && mutation.error}
        </ScrollWrapper>
      )}
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
