import { useMutation } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { StyledTable, StyledTD } from '../../components/ResourceTable'
import { formatDate, itemsCountString } from '../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { ISpaceReport } from './space-report.types'
import { deleteReports } from './space-reports.api'
import { reportStateToTextMap } from './useSpaceReportColumns'
import { Button } from '../../components/Button'


const StyledReportTable = styled(StyledTable)`
  padding: 0.5rem;
`

export function useDeleteSpaceReportModal({
  selected,
  onClose,
}: {
  selected: ISpaceReport[]
  onClose?: () => void
}) {
  const { isShown, setShowModal } = useModal()

  const close = () => {
    if (onClose) onClose()
    setShowModal(false)
  }

  const momoSelected = useMemo(() => selected, [isShown])

  const mutation = useMutation({
    mutationKey: ['delete-space-report'],
    mutationFn: deleteReports,
    onError: () => {
      toast.error('Error: Deleting space reports')
    },
    onSuccess: (res) => {
      close()
      toast.success(
        `${itemsCountString('report', res?.length ?? 0)} deleted`,
      )
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
    <ModalNext
      id="space-report-delete-modal"
      isShown={isShown}
      hide={() => close()}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Delete ${itemsCountString('report', momoSelected.length)}?`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <StyledReportTable>
          <thead>
          <tr>
            <th>Created at</th>
            <th>State</th>
          </tr>
          </thead>
          <tbody>
          {momoSelected.map((report) => (
            <tr key={report.id}>
              <StyledTD>{formatDate(report.createdAt)}</StyledTD>
              <StyledTD>{reportStateToTextMap[report.state]}</StyledTD>
            </tr>
          ))}
          </tbody>
        </StyledReportTable>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => close()}>Cancel</Button>
          <Button data-variant="warning" onClick={handleSubmit} disabled={mutation.isPending}>
            Delete
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
