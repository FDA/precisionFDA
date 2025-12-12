import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuthUser } from '../auth/useAuthUser'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useDeleteModal } from '../actionModals/useDeleteModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useExportToModal } from '../apps/useExportToModal'
import { HomeScope } from '../home/types'
import { Action } from '../home/action-types'
import { copyWorkflowsRequest, deleteWorkflowRequest, WorkflowCopyResponse } from './workflows.api'
import { IWorkflow } from './workflows.types'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { toastSuccess } from '../../components/NotificationCenter/ToastHelper'

export const useWorkflowSelectActions = ({
  homeScope,
  spaceId,
  selectedItems,
  resourceKeys,
  resetSelected,
}: {
  homeScope?: HomeScope
  spaceId?: string
  selectedItems: IWorkflow[]
  resourceKeys: string[]
  resetSelected?: () => void
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user ? user.admin : false

  const featureMutation = useFeatureMutation({
    resource: 'workflows',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const { modalComp: copyToSpaceModal, setShowModal: setCopyToSpaceModal } = useCopyToSpaceModal<IWorkflow>({
    resource: 'workflows',
    selected,
    updateFunction: copyWorkflowsRequest,
    onSuccess: res => {
      const workflowRes = res as WorkflowCopyResponse
      toastSuccess('The workflow has been copied to the space successfully.')
      queryClient.invalidateQueries({ queryKey: resourceKeys }).then(() => {
        if (workflowRes.workflows && Array.isArray(workflowRes.workflows) && workflowRes.workflows.length > 0) {
          navigate(`/home/workflows/${workflowRes.workflows[0].uid}`)
        }
      })
    },
  })

  const { modalComp: tagsModal, setShowModal: setTagsModal } = useEditTagsModal({
    resource: 'workflows',
    selected: { uid: `workflow-series-${selected[0]?.workflow_series_id}`, name: selected[0]?.name, tags: selected[0]?.tags },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const { modalComp: propertiesModal, setShowModal: setPropertiesModal } = useEditPropertiesModal<IWorkflow>({
    selected: selected.map(wrkflw => ({ ...wrkflw, id: wrkflw.workflow_series_id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties'] })
    },
  })

  const { modalComp: deleteModal, setShowModal: setDeleteModal } = useDeleteModal({
    resource: 'workflow',
    selected: selected.map(s => ({ name: s.name, id: s.uid, location: s.location })),
    request: (ids: string[]) => deleteWorkflowRequest(ids.map(String)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workflows'],
      })
      if (spaceId) {
        navigate(`/spaces/${spaceId}/workflows`)
      } else {
        navigate('/home/workflows')
      }
      if (resetSelected) resetSelected()
    },
  })

  const { modalComp: exportToModal, setShowModal: setExportToModal } = useExportToModal({
    selected: selected[0],
    resource: 'workflows',
  })

  const links = selected[0]?.links

  const actions: Action[] = useMemo(() => {
    const allActions: Action[] = [
      {
        name: 'Run',
        type: 'route',
        to: `${links?.show}/analyses/new`,
        isDisabled: selected.length !== 1 || !links?.run_workflow,
        cloudResourcesConditionType: 'all',
      },
      {
        name: 'Run Batch',
        type: 'link',
        link: links?.batch_run_workflow || '',
        isDisabled: selected.length !== 1 || !links?.batch_run_workflow,
        cloudResourcesConditionType: 'all',
      },
      {
        name: 'Diagram',
        type: 'link',
        link: links?.diagram || '',
        isDisabled: selected.length !== 1 || !links?.diagram,
      },
      {
        name: 'Edit',
        type: 'link',
        link: links?.edit || '',
        isDisabled: selected.length !== 1 || !links?.edit,
      },
      {
        name: 'Fork',
        type: 'link',
        link: links?.fork || '',
        isDisabled: selected.length !== 1 || !links?.fork,
      },
      {
        name: 'Export to',
        type: 'modal',
        func: () => setExportToModal(true),
        isDisabled: selected.length !== 1,
      },
      {
        name: 'Feature',
        type: 'modal',
        func: () => {
          featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
        },
        isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
        shouldHide: !isAdmin || homeScope !== 'everybody',
      },
      {
        name: 'Unfeature',
        type: 'modal',
        func: () => {
          featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
        },
        isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
        shouldHide: !isAdmin || (homeScope !== 'everybody' && homeScope !== 'featured'),
      },
      {
        name: 'Delete',
        type: 'modal',
        func: () => setDeleteModal(true),
        shouldHide: homeScope === 'spaces',
        isDisabled: selected.some(e => !e.links?.delete) || selected.length === 0,
      },
      {
        name: 'Copy to space',
        type: 'modal',
        func: () => setCopyToSpaceModal(true),
        isDisabled: selected.length === 0 || selected.some(e => !e.links?.copy),
      },
      {
        name: 'Comments',
        type: 'link',
        link: `/workflows/${selected[0]?.uid}/comments`,
        isDisabled: false,
        shouldHide: selected.length !== 1,
      },
      {
        name: 'Edit tags',
        type: 'modal',
        func: () => setTagsModal(true),
        isDisabled: false,
        shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || selected.length !== 1,
      },
      {
        name: 'Edit properties',
        type: 'modal',
        func: () => setPropertiesModal(true),
        isDisabled: selected.length === 0,
        shouldHide: !isAdmin && selected[0]?.added_by !== user?.full_name,
      },
    ]

    if (homeScope === 'spaces') {
      return allActions.filter(action => ['Fork', 'Export to', 'Copy to space'].includes(action.name))
    }

    return allActions
  }, [
    selected,
    links,
    homeScope,
    isAdmin,
    user?.full_name,
    featureMutation,
    setExportToModal,
    setDeleteModal,
    setCopyToSpaceModal,
    setTagsModal,
    setPropertiesModal,
  ])

  const modals = useMemo(
    () => ({
      'Copy to space': copyToSpaceModal,
      Delete: deleteModal,
      'Export to': exportToModal,
      'Edit tags': tagsModal,
      'Edit properties': propertiesModal,
    }),
    [copyToSpaceModal, deleteModal, exportToModal, tagsModal, propertiesModal],
  )

  return { actions, modals }
}
