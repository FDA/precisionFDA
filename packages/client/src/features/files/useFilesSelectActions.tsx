import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pick } from 'ramda'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { displayPayloadMessage } from '../../utils/api'
import { useAttachToModal } from '../actionModals/useAttachToModal'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { getBaseLink } from '../apps/run/utils'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionFunctionsType, HomeScope, ServerScope } from '../home/types'
import { useAcceptLicenseModal } from '../licenses/useAcceptLicenseModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import { isActionDisabledBasedOnLocked, isActionDisabledBasedOnProtected, isActionDisabledBasedOnRole } from '../spaces/common'
import { ISpace } from '../spaces/spaces.types'
import { useCopyFilesModal } from './actionModals/useCopyFilesModal'
import { useDeleteFileModal } from './actionModals/useDeleteFileModal'
import { useDownloadFileModal } from './actionModals/useDownloadFileModal'
import { useEditFileModal } from './actionModals/useEditFileModal'
import { useEditFolderModal } from './actionModals/useEditFolderModal'
import { useLockUnlockFileModal } from './actionModals/useLockUnlockFileModal'
import { useOpenFileModal } from './actionModals/useOpenFileModal'
import { useOrganizeFileModal } from './actionModals/useOrganizeFileModal'
import { moveFilesRequest } from './files.api'
import { IFile } from './files.types'

export type FileActions =
  'Track' |
  'Open' |
  'Download' |
  'Edit file info' |
  'Edit folder info' |
  'Make file public' |
  'Make folder public' |
  'Feature' |
  'Unfeature' |
  'Delete' |
  'Organize' |
  'Copy to...' |
  'Attach to...' |
  'Attach License' |
  'Detach License' |
  'Request license approval' |
  'Accept License' |
  'Edit tags' |
  'Edit properties' |
  'Lock' |
  'Unlock' |
  'Rename' |
  'Comments'


const getFileScope = (scope: HomeScope | undefined, space: ISpace | undefined): ServerScope => {
  if (scope) {
    switch (scope) {
      case 'me':
        return 'private'
      case 'everybody':
        return 'public'
      case 'featured':
        return 'public'
      default:
        return 'private'
    }
  }
  return `space-${space?.id}`
}

export const useFilesSelectActions = ({
  homeScope,
  folderId,
  space,
  selectedItems,
  resourceKeys,
  resetSelected,
}: {
  homeScope?: HomeScope
  space?: ISpace
  folderId?: string
  selectedItems: IFile[]
  resourceKeys: string[]
  resetSelected?: () => void
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user?.admin
  const isViewer = space?.current_user_membership.role === 'viewer'
  const openSelected = selected.some(e => e.state === 'open')

  const featureMutation = useFeatureMutation({
    resource: 'files',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const moveFilesMutation = useMutation({
    mutationKey: ['move-files'],
    mutationFn: (folderIdParam: number) => {
      const selectedIds = selected.map(f => f.id)
      return moveFilesRequest(selectedIds, folderIdParam, homeScope, space?.id)
    },
    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      displayPayloadMessage(res)
      if (resetSelected) resetSelected()
    },
    onError: () => {
      toast.error('Error: Moving files')
    },
  })

  const { modalComp: openFileModal, setShowModal: setOpenFileModal, isShown: isShownOpenFileModal } = useOpenFileModal(selected)
  const {
    modalComp: downloadModal,
    setShowModal: setDownloadModal,
    isShown: isShownDownloadModal,
  } = useDownloadFileModal(selected, getFileScope(homeScope, space))
  const {
    modalComp: attachLicensesModal,
    setShowModal: setAttachLicensesModal,
    isShown: isShownAttachLicensesModal,
  } = useAttachLicensesModal<IFile>({
    selected: selected[0],
    resource: 'files',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: acceptLicensesModal,
    setShowModal: setAcceptLicensesModal,
    isShown: isShownAcceptLicensesModal,
  } = useAcceptLicenseModal<IFile>({
    selected: selected[0],
    resource: 'files',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: detachLicenseModal,
    setShowModal: setDetachLicenseModal,
    isShown: isShownDetachLicenseModal,
  } = useDetachLicenseModal<IFile>({
    selected: selected[0],
    resource: 'files',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: editFileModal,
    setShowModal: setEditFileModal,
    isShown: isShownEditFileModal,
  } = useEditFileModal(selected[0])
  const {
    modalComp: editFolderModal,
    setShowModal: setEditFolderModal,
    isShown: isShownEditFolderModal,
  } = useEditFolderModal(selected[0])

  const {
    modalComp: deleteFileModal,
    setShowModal: setDeleteFileModal,
    isShown: isShownDeleteFileModal,
  } = useDeleteFileModal({
    selected: selected.filter(e => !e.locked),
    scope: getFileScope(homeScope, space),
    onSuccess: () => {
      if (space) {
        if (folderId) {
          navigate(`/spaces/${space.id}/files?folder_id=${folderId}`)
          queryClient.invalidateQueries({
            queryKey: ['files', folderId],
          })
        } else {
          navigate(`/spaces/${space.id}/files`)
          queryClient.invalidateQueries({
            queryKey: ['files'],
          })
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (folderId) {
          navigate(`/home/files?folder_id=${folderId}`)
          queryClient.invalidateQueries({
            queryKey: ['files', folderId],
          })
        } else {
          navigate('/home/files')
          queryClient.invalidateQueries({
            queryKey: ['files'],
          })
        }
      }
      if (resetSelected) resetSelected()
    },
  })

  const {
    modalComp: unlockFileModal,
    setShowModal: setUnlockFileModal,
    isShown: isShownUnlockFileModal,
  } = useLockUnlockFileModal({
    selected: selected.filter(e => e.locked),
    scope: getFileScope(homeScope, space),
    type: 'unlock',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      if (resetSelected) resetSelected()
    },
  })
  const {
    modalComp: lockFileModal,
    setShowModal: setLockFileModal,
    isShown: isShownLockFileModal,
  } = useLockUnlockFileModal({
    selected: selected.filter(e => !e.locked),
    scope: getFileScope(homeScope, space),
    type: 'lock',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      if (resetSelected) resetSelected()
    },
  })
  const {
    modalComp: organizeFileModal,
    setShowModal: setOrganizeFileModal,
    isShown: isShownOrganizeFileModal,
  } = useOrganizeFileModal({
    headerText: `Move ${selected.length} item${selected.length === 1 ? '' : 's'}`,
    submitCaption: 'Move',
    scope: getFileScope(homeScope, space),
    onHandleSubmit: selectedFolderId => {
      moveFilesMutation.mutateAsync(selectedFolderId).then(() => {
        setOrganizeFileModal(false)
      })
    },
  })
  const sourceScopes = new Set()
  const selectedIds = selected.map(f => {
    sourceScopes.add(f.scope)
    return f.id
  })
  const {
    modalComp: copyToModal,
    setShowModal: setCopyToModal,
    isShown: isShownCopyToModal,
  } = useCopyFilesModal({
    sourceScopes: Array.from(sourceScopes.values()) as ServerScope[],
    selectedIds: selectedIds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(
    selected.map(s => s.id),
    'FILE',
  )
  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IFile>({
    resource: 'files',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: propertiesModal,
    setShowModal: setPropertiesModal,
    isShown: isShownPropertiesModal,
  } = useEditPropertiesModal<IFile>({
    type: 'node',
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties', 'node'] })
    },
  })

  const availableLicenses = user?.links?.licenses ? user.links.licenses : false
  const isFolder = selected.every(e => e.type === 'Folder')

  let actions: ActionFunctionsType<FileActions> = {
    Track: {
      type: 'route',
      to: `/${getBaseLink(space?.id)}/files/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1 || openSelected,
    },
    Open: {
      type: 'modal',
      func: () => setOpenFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => e.locked) ||
        isActionDisabledBasedOnProtected(user?.id as number, space) ||
        selected.some(e => e.type === 'Folder' || (e.type === 'UserFile' && !e.links.download) || e.show_license_pending) ||
        openSelected,
      modal: openFileModal,
      showModal: isShownOpenFileModal,
    },
    Download: {
      type: 'modal',
      func: () => setDownloadModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => e.locked) ||
        isActionDisabledBasedOnProtected(user?.id as number, space) ||
        selected.some(e => (e.type === 'UserFile' && !e.links.download) || e.show_license_pending) ||
        openSelected,
      modal: downloadModal,
      showModal: isShownDownloadModal,
    },
    'Edit file info': {
      type: 'modal',
      func: () => setEditFileModal(true),
      modal: editFileModal,
      isDisabled: selected.length !== 1 || user?.full_name !== selected[0].added_by || selected.some(e => e.locked) || selected.some(e => e.resource),
      showModal: isShownEditFileModal,
      shouldHide: isFolder || selected.length !== 1 || homeScope === 'spaces' || openSelected,
    },
    'Edit folder info': {
      type: 'modal',
      func: () => setEditFolderModal(true),
      isDisabled: selected.length !== 1 || selected.some(e => e.locked),
      modal: editFolderModal,
      showModal: isShownEditFolderModal,
      shouldHide: !isFolder || selected.length !== 1 || homeScope === 'spaces',
    },
    'Make file public': {
      type: 'link',
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      },
      isDisabled: selected.length !== 1 || selected[0].location === 'Public' || !user?.allowed_to_publish,
      shouldHide:
        isFolder || selected.length !== 1 || homeScope !== 'me' || selected[0].links?.publish === undefined || openSelected,
    },
    Feature: {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({
          featured: true,
          uids: selected.map(f => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature) || openSelected,
      shouldHide: homeScope !== 'everybody' || selected.some(e => e.featured) || !isAdmin,
    },
    Unfeature: {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({
          featured: false,
          uids: selected.map(f => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature) || openSelected,
      shouldHide: selected.some(e => !e.featured) || (homeScope !== 'everybody' && homeScope !== 'featured') || !isAdmin,
    },
    Delete: {
      type: 'modal',
      func: () => setDeleteFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => !e.links.remove) ||
        isActionDisabledBasedOnProtected(user?.id, space) ||
        selected.every(e => e.locked),
      shouldHide: isViewer,
      modal: deleteFileModal,
      showModal: isShownDeleteFileModal,
    },
    Lock: {
      type: 'modal',
      func: () => setLockFileModal(true),
      isDisabled: false,
      shouldHide: isActionDisabledBasedOnRole(user?.id, space) || selected.every(e => e.locked),
      modal: lockFileModal,
      showModal: isShownLockFileModal,
    },
    Unlock: {
      type: 'modal',
      func: () => setUnlockFileModal(true),
      isDisabled: false,
      shouldHide: isActionDisabledBasedOnRole(user?.id, space) || selected.every(e => !e.locked),
      modal: unlockFileModal,
      showModal: isShownUnlockFileModal,
    },
    Organize: {
      type: 'modal',
      func: () => setOrganizeFileModal(true),
      isDisabled: selected.length === 0 || selected.some(e => e.locked) || selected.some(e => !e.links.organize) || openSelected,
      modal: organizeFileModal,
      showModal: isShownOrganizeFileModal,
      shouldHide: !isAdmin && homeScope !== 'me' && isViewer,
    },
    'Copy to...': {
      type: 'modal',
      func: () => setCopyToModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => !e.links.copy) ||
        openSelected ||
        isActionDisabledBasedOnLocked(selected, user?.id, space),
      modal: copyToModal,
      showModal: isShownCopyToModal,
    },
    'Attach to...': {
      type: 'modal',
      func: () => setAttachToModal(true),
      // TODO: filesAttachTo is missing
      isDisabled:
        selected.length === 0 ||
        selected.some(e => !e.links.attach_to) ||
        openSelected ||
        isActionDisabledBasedOnLocked(selected, user?.id, space),
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    'Attach License': {
      type: 'modal',
      func: () => setAttachLicensesModal(true),
      isDisabled: selected.length !== 1 || !selected[0].links.license || !availableLicenses || openSelected,
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
      shouldHide: selected.length !== 1 || !selected[0]?.links?.license || !availableLicenses,
    },
    'Detach License': {
      type: 'modal',
      func: () => setDetachLicenseModal(true),
      isDisabled: selected.length !== 1 || !selected[0].links.license || !availableLicenses || openSelected,
      modal: detachLicenseModal,
      showModal: isShownDetachLicenseModal,
      shouldHide: selected.length !== 1 || !selected[0]?.links?.detach_license,
    },
    'Request license approval': {
      type: 'link',
      link: `/licenses/${selected[0]?.file_license?.id}/request_approval`,
      shouldHide: !selected[0]?.links?.request_approval_license,
    },
    'Accept License': {
      type: 'modal',
      func: () => setAcceptLicensesModal(true),
      modal: acceptLicensesModal,
      showModal: isShownAcceptLicensesModal,
      isDisabled: openSelected,
      shouldHide: selected.length !== 1 || !selected[0]?.links?.accept_license_action,
    },
    'Edit tags': {
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: openSelected || isFolder || selected.some(e => e.locked),
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || selected.length !== 1 || homeScope === 'spaces',
    },
    'Edit properties': {
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: openSelected || selected.some(e => e.locked),
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || homeScope === 'spaces',
    },
    Comments: {
      type: 'link',
      link: `/files/${selected[0]?.uid}/comments`,
      isDisabled: false,
    },
  }

  if (homeScope === 'spaces') {
    actions = pick(['Open', 'Download', 'Rename', 'Copy to...', 'Comments', 'Delete'], actions)
  }

  return actions
}
