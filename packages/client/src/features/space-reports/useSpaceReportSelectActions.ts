import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ActionFunctionsType } from '../home/types'
import { ISpaceReport, SpaceReportState } from './space-report.types'
import { useDeleteSpaceReportModal } from './useDeleteSpaceReportModal'

export enum ReportActions {
  'Delete' = 'Delete',
}

const DELETABLE_STATES: SpaceReportState[] = ['DONE', 'ERROR']

export const userReportSelectActions = ({
  scope,
  selectedItems,
  resetSelected,
}: {
  scope?: string,
  selectedItems: ISpaceReport[],
  resetSelected?: () => void,
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)

  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteSpaceReportModal({
    selected,
    onClose: () => {
      queryClient.invalidateQueries({
        queryKey: ['space-reports'],
      })
      if (scope?.startsWith('space-')) {
        navigate(`/spaces/${scope.split('-')[1]}/reports`)
      } else {
        navigate('/home/reports')
      }

      if(resetSelected) resetSelected()
    },
  })

  return {
    'Delete': {
      type: 'modal',
      func: () => setDeleteModal(true),
      isDisabled: selected.length === 0 || selected.some(r => !DELETABLE_STATES.includes(r.state)),
      modal: deleteModal,
      showModal: isShownDeleteModal,
    },
  } satisfies ActionFunctionsType<ReportActions>
}
