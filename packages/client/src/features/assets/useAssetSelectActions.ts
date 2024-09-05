import { pick } from 'ramda'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthUser } from '../auth/useAuthUser'
import { useAttachToModal } from '../actionModals/useAttachToModal'
import { useDeleteModal } from '../actionModals/useDeleteModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useAcceptLicenseModal } from '../licenses/useAcceptLicenseModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import { ActionFunctionsType, HomeScope } from '../home/types'
import { useDownloadAssetsModal } from './actionModals/useDownloadAssetsModal'
import { useEditAssetModal } from './actionModals/useEditAssetModal'
import { deleteAssetsRequest } from './assets.api'
import { IAsset } from './assets.types'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'

export type AssetActions =
  'Rename' |
  'Download' |
  'Feature' |
  'Unfeature' |
  'Make Public' |
  'Attach to...' |
  'Delete' |
  'Attach License' |
  'Detach License' |
  'Request license approval' |
  'Accept License' |
  'Edit tags' |
  'Edit properties' |
  'Comments'

type AssetActionArgs = {
  homeScope?: HomeScope,
  selectedItems: IAsset[],
  resourceKeys: string[],
  resetSelected?: () => void
}

export const useAssetActions = ({ homeScope, selectedItems, resourceKeys, resetSelected }: AssetActionArgs) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user?.admin

  const featureMutation = useFeatureMutation({
    resource: 'assets',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(selected.map(s => s.id), 'ASSET')
  const {
    modalComp: downloadModal,
    setShowModal: setDownloadModal,
    isShown: isShownDownloadModal,
  } = useDownloadAssetsModal(selected)
  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'asset',
    selected: selected.map(s => ({ id: s.uid, name: s.name, location: s.location })),
    request: deleteAssetsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assets'],
      })
      navigate('/home/assets')
      if(resetSelected) resetSelected()
    },
  })
  const {
    modalComp: editModal,
    setShowModal: setEditModal,
    isShown: isShownEditModal,
  } = useEditAssetModal(selected[0])

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
    type: 'node',
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties', 'node'] })
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

  const availableLicenses = user?.links?.licenses ? user.links.licenses : false


  let actions: ActionFunctionsType<AssetActions> = {
    'Rename': {
      type: 'modal',
      isDisabled: selected.length !== 1,
      func: () => setEditModal(true),
      modal: editModal,
      showModal: isShownEditModal,
    },
    'Download': {
      type: 'modal',
      isDisabled: selected.length === 0 || selected.some(e => !e.links?.download),
      func: () => setDownloadModal(true),
      modal: downloadModal,
      showModal: isShownDownloadModal,
    },
    'Feature': {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      shouldHide: !isAdmin || homeScope !== 'everybody',
    },
    'Unfeature': {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      shouldHide: !isAdmin || (homeScope !== 'featured' && homeScope !== 'everybody'),
    },
    'Make Public': {
      type: 'link',
      isDisabled: selected.length !== 1 || !selected[0]?.links?.publish || !user?.allowed_to_publish,
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      },
    },
    'Attach to...': {
      type: 'modal',
      isDisabled: selected.length === 0 || selected.some(e => !e?.links?.attach_to),
      func: () => setAttachToModal(true),
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    'Delete': {
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.remove,
      func: () => setDeleteModal(true),
      modal: deleteModal,
      showModal: isShownDeleteModal,
      shouldHide: homeScope === 'spaces',
    },
    'Attach License': {
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links?.license || !availableLicenses,
      func: () => setAttachLicensesModal(true),
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
    },
    'Detach License': {
      type: 'modal',
      isDisabled: selected.length !== 1 ||
        !selected[0].links.license ||
        !availableLicenses,
      func: () => setDetachLicensesModal(true),
      modal: detachLicensesModal,
      showModal: isShownDetachLicensesModal,
      shouldHide: selected.length !== 1 || !selected[0]?.links?.detach_license,
    },
    'Request license approval': {
      type: 'link',
      isDisabled: selected.length !== 1,
      link: selected[0]?.links.request_approval_license,
      shouldHide: !selected[0]?.links.request_approval_license,
    },
    'Accept License': {
      type: 'modal',
      func: () => setAcceptLicensesModal(true),
      modal: acceptLicensesModal,
      showModal: isShownAcceptLicensesModal,
      isDisabled: false,
      shouldHide: selected.length !== 1 || !selected[0]?.links.accept_license_action,
    },
    'Edit tags': {
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || (selected.length !== 1),
    },
    'Edit properties': {
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: false,
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name),
    },
    'Comments': {
      type: 'link',
      isDisabled: selected.length !== 1,
      shouldHide: selected.length !== 1,
      link: `/assets/${selected[0]?.uid}/comments`,
    },
  }

  if(homeScope === 'spaces') {
    actions = pick(['Download', 'Attach to...'], actions)
  }

  return actions
}
