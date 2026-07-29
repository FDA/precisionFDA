import { useMutation } from '@tanstack/react-query'
import { type ReactElement, useState } from 'react'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { SideTabs } from '../../components/SideTab/SideTabs'
import { Checkbox } from '../../components/ui/checkbox'
import { colors } from '../../styles/theme'
import type { AcceptedLicense } from '../apps/apps.types'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer } from '../modal/modal.styles'
import { useModal } from '../modal/useModal'
import { acceptLicensesRequest } from './api'
import type { License } from './types'

const StyledLicenceTitle = styled.div``

const StyledTabTitle = styled.div`
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
`

const StyledBodyTitle = styled.div`
  font-size: 18px;
  color: ${colors.blueOnWhite};
`

const StyledSeparation = styled.hr`
  border: 0;
  border-top: 1px solid #eeeeee;
`

const StyledLink = styled.a`
  size: 12px;
`

const StyledWarning = styled.div`
  color: #8a6d3b;
`

const WrapSideTabs = styled.div`
  margin: 0 12px;
  margin-bottom: 24px;
`
const SideTab = styled.div<{ title?: React.ReactElement }>``
const Text = styled.div`
  margin: 24px 12px;
`
/**
 * For licenses that are pending set state from licensesToAccept array.
 * Remove licenses to accept if they are in array acceptedLicenses.
 *
 * @param licensesToAccept - licenses that need to be accepted
 * @param acceptedLicenses - licenses accepted by current user
 */
const setLicenseStateAndFilter = (licensesToAccept: License[], acceptedLicenses: AcceptedLicense[]): License[] => {
  const filteredToAccept: License[] = []
  licensesToAccept.forEach(licenseToAccept => {
    let alreadyAccepted = false
    acceptedLicenses.forEach(acceptedLicense => {
      if (licenseToAccept.id.toString() === acceptedLicense.license.toString()) {
        if (acceptedLicense.state === 'pending') {
          const pendingLicense = { ...licenseToAccept }
          pendingLicense.state = 'pending'
          filteredToAccept.push(pendingLicense)
        }
        alreadyAccepted = true
      }
    })
    if (!alreadyAccepted) {
      filteredToAccept.push(licenseToAccept)
    }
  })
  return filteredToAccept
}

export const useAcceptLicensesModal = () => {
  const [licenses, setLicenses] = useState([] as License[])
  const [selectedLicenses, setSelectedLicenses] = useState([] as License[])
  const { isShown, setShowModal } = useModal()

  const setLicensesAndShow = (licensesToAccept: License[], acceptedLicenses: AcceptedLicense[]) => {
    const filtered = setLicenseStateAndFilter(licensesToAccept, acceptedLicenses)
    setLicenses(filtered)
    setShowModal(true)
  }

  const handleCheckedChange = (checked: boolean, license: License) => {
    if (checked) {
      setSelectedLicenses(prev => [...prev, license])
    } else {
      setSelectedLicenses(prev => prev.filter(element => element.id !== license.id))
    }
  }

  const getTitle = (license: License): ReactElement => (
    <>
      {!license.approval_required && (
        <Checkbox
          checked={selectedLicenses.some(selectedLicense => selectedLicense.id === license.id)}
          onCheckedChange={checked => handleCheckedChange(checked, license)}
        />
      )}
      <StyledTabTitle>
        <StyledLicenceTitle>{license.title}</StyledLicenceTitle>
        <ChevronRightIcon height={12} width={12} />
      </StyledTabTitle>

      {license.approval_required && license.state !== 'pending' && (
        <StyledLink href={`/licenses/${license.id}/request_approval`} target="_blank">
          Request Approval
        </StyledLink>
      )}
      {license.approval_required && license.state === 'pending' && <StyledWarning>Pending Approval</StyledWarning>}
    </>
  )

  const mutation = useMutation({
    mutationFn: ({ licenseIds }: { licenseIds: string[] }) => acceptLicensesRequest({ licenseIds }),
    onError: err => {
      toastError(`Accepting licenses: ${err}`)
    },
    onSuccess: res => {
      setShowModal(false)
      toastSuccess(`Accepted ${res.acceptedLicenses.length} license(s)`)
    },
  })

  const handleSubmit = () => {
    const licenseIds: string[] = selectedLicenses.map(license => license.id)
    if (selectedLicenses.length > 0) {
      mutation.mutateAsync({ licenseIds })
    }
    setSelectedLicenses([])
  }

  const modalComp = (
    <ModalNext
      headerText="Accept Licenses"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="large"
      id="accept-licenses-modal"
    >
      <ModalHeaderTop headerText="Accept Licenses" hide={() => setShowModal(false)} />
      <div style={{ padding: '1rem' }}>
        <Text>The item/s you selected require that you accept the following license/s before proceeding.</Text>
        <WrapSideTabs>
          <SideTabs>
            {licenses.map(license => (
              <SideTab key={license.id} title={getTitle(license)}>
                <StyledBodyTitle>{license.title}</StyledBodyTitle>
                <StyledSeparation />
                {license.content}
              </SideTab>
            ))}
          </SideTabs>
        </WrapSideTabs>
      </div>
      <Footer>
        <ButtonRow>
          <Button
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button data-variant="primary" disabled={selectedLicenses.length === 0} onClick={() => handleSubmit()}>
            Accept Selected Licenses
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    setLicensesAndShow,
    isShown,
  }
}
