import { useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router'
import { ActionFunctionsType } from '../home/types'
import { ISpaceReport, SpaceReportState } from './space-report.types'
import { useDeleteSpaceReportModal } from './useDeleteSpaceReportModal'

export enum AppActions {
  'Delete' = 'Delete',
}

const DELETABLE_STATES: SpaceReportState[] = ['DONE', 'ERROR']

export const userReportSelectActions = ({
  spaceId,
  selectedItems,
  resetSelected,
}: {
  spaceId?: number,
  selectedItems: ISpaceReport[],
  resetSelected?: () => void,
}) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter(x => x !== undefined)

  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteSpaceReportModal({
    selected,
    onClose: () => {
      queryClient.invalidateQueries(['space-reports'])
      history.push(`/spaces/${spaceId}/reports`)
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
  } satisfies ActionFunctionsType<AppActions>
}
