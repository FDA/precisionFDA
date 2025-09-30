import { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useDeleteModal } from '../actionModals/useDeleteModal'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useAuthUser } from '../auth/useAuthUser'
import { HomeScope } from '../home/types'
import { Action } from '../home/action-types'
import { useAcceptLicenseModal } from '../licenses/useAcceptLicenseModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import { useDownloadAssetsModal } from './actionModals/useDownloadAssetsModal'
import { useEditAssetModal } from './actionModals/useEditAssetModal'
import { IAsset } from './assets.types'
import { deleteFilesRequest } from '../files/files.api'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { useLicensesListQuery } from '../licenses/queries'

export interface UseAssetActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

type AssetActionArgs = {
  homeScope?: HomeScope
  selectedItems: IAsset[]
  resourceKeys: string[]
  resetSelected?: () => void
}

export const useAssetActions = ({
  homeScope,
  selectedItems,
  resourceKeys,
  resetSelected,
}: AssetActionArgs): UseAssetActionsResult => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)
  const { data: licenses } = useLicensesListQuery()
  const user = useAuthUser()
  const isAdmin = user?.admin
  const selectedButNotClosed = selected.some(e => e.state !== 'closed')

  const featureMutation = useFeatureMutation({
    resource: 'assets',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: downloadModal,
    setShowModal: setDownloadModal,
    isShown: isShownDownloadModal,
  } = useDownloadAssetsModal(selected)
  const ids = selected.map(s => s.id)
  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'asset',
    selected: selected.map(s => ({ id: s.uid, name: s.name, location: s.location })),
    request: () => deleteFilesRequest(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assets'],
      })
      navigate('/home/assets')
      if (resetSelected) resetSelected()
    },
  })
  const { modalComp: editModal, setShowModal: setEditModal, isShown: isShownEditModal } = useEditAssetModal(selected[0])

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IAsset>({
    resource: 'assets',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: propertiesModal,
    setShowModal: setPropertiesModal,
    isShown: isShownPropertiesModal,
  } = useEditPropertiesModal<IAsset>({
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties'] })
    },
  })

  const {
    modalComp: attachLicensesModal,
    setShowModal: setAttachLicensesModal,
    isShown: isShownAttachLicensesModal,
  } = useAttachLicensesModal<IAsset>({
    resource: 'assets',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: acceptLicensesModal,
    setShowModal: setAcceptLicensesModal,
    isShown: isShownAcceptLicensesModal,
  } = useAcceptLicenseModal<IAsset>({
    selected: selected[0],
    resource: 'assets',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: detachLicensesModal,
    setShowModal: setDetachLicensesModal,
    isShown: isShownDetachLicensesModal,
  } = useDetachLicenseModal<IAsset>({
    resource: 'assets',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const availableLicenses = Boolean(licenses?.licenses.length !== 0)

  const actions: Action[] = [
    {
      name: 'Rename',
      type: 'modal',
      isDisabled: selected.length !== 1 || selectedButNotClosed,
      func: () => setEditModal(true),
      modal: editModal,
      showModal: isShownEditModal,
    },
    {
      name: 'Download',
      type: 'modal',
      isDisabled: selected.length === 0 || selected.some(e => !e.links?.download) || selectedButNotClosed,
      func: () => setDownloadModal(true),
      modal: downloadModal,
      showModal: isShownDownloadModal,
    },
    {
      name: 'Feature',
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature) || selectedButNotClosed,
      shouldHide: !isAdmin || homeScope !== 'everybody',
    },
    {
      name: 'Unfeature',
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature) || selectedButNotClosed,
      shouldHide: !isAdmin || (homeScope !== 'featured' && homeScope !== 'everybody'),
    },
    {
      name: 'Make Public',
      type: 'link',
      isDisabled: selected.length !== 1 || selectedButNotClosed || !user?.allowed_to_publish,
      link: {
        method: 'GET' as const,
        url: `/publish?identifier=${selected[0]?.uid}&type=asset`,
      },
    },
    {
      name: 'Delete',
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.remove,
      func: () => setDeleteModal(true),
      modal: deleteModal,
      showModal: isShownDeleteModal,
      shouldHide: homeScope === 'spaces',
    },
    {
      name: 'Attach License',
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links?.license || !availableLicenses || selectedButNotClosed,
      func: () => setAttachLicensesModal(true),
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
    },
    {
      name: 'Detach License',
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0].links.license || !availableLicenses || selectedButNotClosed,
      func: () => setDetachLicensesModal(true),
      modal: detachLicensesModal,
      showModal: isShownDetachLicensesModal,
      shouldHide: selected.length !== 1 || !selected[0]?.links?.detach_license,
    },
    {
      name: 'Request license approval',
      type: 'link',
      isDisabled: selected.length !== 1 || selectedButNotClosed,
      link: selected[0]?.links.request_approval_license || '',
      shouldHide: !selected[0]?.links.request_approval_license,
    },
    {
      name: 'Accept License',
      type: 'modal',
      func: () => setAcceptLicensesModal(true),
      modal: acceptLicensesModal,
      showModal: isShownAcceptLicensesModal,
      isDisabled: false,
      shouldHide: selected.length !== 1 || !selected[0]?.links.accept_license_action || selectedButNotClosed,
    },
    {
      name: 'Edit tags',
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || selected.length !== 1 || selectedButNotClosed,
    },
    {
      name: 'Edit properties',
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: selected.length === 0,
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || selectedButNotClosed,
    },
    {
      name: 'Comments',
      type: 'link',
      isDisabled: selected.length !== 1,
      shouldHide: selected.length !== 1 || selectedButNotClosed,
      link: `/assets/${selected[0]?.uid}/comments`,
    },
  ]

  let filteredActions = actions

  if (homeScope === 'spaces') {
    filteredActions = actions.filter(action => action.name === 'Download')
  }

  const modals = extractModalsFromActions(actions)

  return { actions: filteredActions, modals }
}
