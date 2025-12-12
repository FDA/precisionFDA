import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { getBaseLink } from '../apps/run/utils'
import { useAuthUser } from '../auth/useAuthUser'
import { Action } from '../home/action-types'
import { BaseAPIResponse, HomeScope, ServerScope } from '../home/types'
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
import { useSelectFolderModal } from './actionModals/useSelectFolderModal'
import { moveFilesRequest } from './files.api'

import { AxiosError } from 'axios'
import { pluralize, sanitizeFileName } from '../../utils/formatting'
import { IFile, TreeOnSelectInfo } from './files.types'
import { displayPayloadMessage, Payload } from '../../utils/api'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { useLicensesListQuery } from '../licenses/queries'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

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
}): { actions: Action[]; modals: Record<string, React.ReactNode | null> } => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const { data: licenses } = useLicensesListQuery()
  const isAdmin = user?.admin
  const isViewer = space?.current_user_membership.role === 'viewer'

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
      return moveFilesRequest(selectedIds, folderIdParam, space?.id)
    },
    onSuccess: res => {
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      displayPayloadMessage(res as Payload)
      if (resetSelected) resetSelected()
    },
    onError: (e: AxiosError<BaseAPIResponse>) => {
      const error = e?.response?.data?.error
      if (error?.message) {
        toastError(error?.message)
        return
      }
      toastError('Moving items has failed')
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
    modalComp: moveFileModal,
    setShowModal: setMoveFileModal,
    isShown: isShownMoveFileModal,
  } = useSelectFolderModal({
    headerText: `Move ${selected.length} ${pluralize('item', selected.length)}`,
    submitCaption: 'Move',
    scope: getFileScope(homeScope, space),
    onHandleSubmit: (selectedFolderId: number, info: TreeOnSelectInfo) => {
      moveFilesMutation.mutateAsync(selectedFolderId).then(() => {
        toastSuccess(`Successfully moved ${selected.length} ${pluralize('item', selected.length)} to ${info.node.title}`)
        setMoveFileModal(false)
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
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties'] })
    },
  })

  const availableLicenses = Boolean(licenses?.licenses.length !== 0)
  const isFolder = selected.every(e => e.type === 'Folder')
  const selectedButNotClosed = selected.some(e => e.type === 'UserFile' && e.state !== 'closed')

  const actions: Action[] = [
    {
      name: 'Track',
      type: 'route',
      to: `/${getBaseLink(space?.id)}/files/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1 || selectedButNotClosed,
      shouldHide: isFolder,
    },
    {
      name: 'Open',
      type: 'modal',
      func: () => setOpenFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => e.locked) ||
        isActionDisabledBasedOnProtected(user?.id as number, space) ||
        selected.some(e => (e.type === 'UserFile' && !e.links.download) || e.show_license_pending) ||
        selectedButNotClosed,
      modal: openFileModal,
      showModal: isShownOpenFileModal,
    },
    {
      name: 'Download',
      type: 'modal',
      func: () => setDownloadModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => e.locked) ||
        isActionDisabledBasedOnProtected(user?.id as number, space) ||
        selected.some(e => (e.type === 'UserFile' && !e.links.download) || e.show_license_pending) ||
        selectedButNotClosed,
      modal: downloadModal,
      showModal: isShownDownloadModal,
    },
    {
      name: 'Edit file info',
      type: 'modal',
      func: () => setEditFileModal(true),
      modal: editFileModal,
      isDisabled:
        selected.length !== 1 ||
        user?.full_name !== selected[0].added_by ||
        selected.some(e => e.locked) ||
        selected.some(e => e.resource),
      showModal: isShownEditFileModal,
      shouldHide: isFolder || selected.length !== 1 || homeScope === 'spaces' || selectedButNotClosed,
    },
    {
      name: 'Edit folder info',
      type: 'modal',
      func: () => setEditFolderModal(true),
      isDisabled: selected.length !== 1,
      modal: editFolderModal,
      showModal: isShownEditFolderModal,
      shouldHide: !isFolder || selected.length !== 1 || homeScope === 'spaces',
    },
    {
      name: 'Make public',
      type: 'link',
      link: {
        method: 'GET' as const,
        url:
          selected[0]?.type === 'UserFile'
            ? `/publish?identifier=${selected[0]?.uid}&type=file`
            : `/publish?identifier=folder-${selected[0]?.id}&type=folder`,
      },
      isDisabled: !user?.allowed_to_publish,
      shouldHide: selected.length !== 1 || homeScope !== 'me' || selectedButNotClosed,
    },
    {
      name: 'Feature',
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({
          featured: true,
          uids: selected.map(f => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature) || selectedButNotClosed,
      shouldHide: homeScope !== 'everybody' || selected.some(e => e.featured) || !isAdmin,
    },
    {
      name: 'Unfeature',
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({
          featured: false,
          uids: selected.map(f => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature) || selectedButNotClosed,
      shouldHide: selected.some(e => !e.featured) || (homeScope !== 'everybody' && homeScope !== 'featured') || !isAdmin,
    },
    {
      name: 'Delete',
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
    {
      name: 'Lock',
      type: 'modal',
      func: () => setLockFileModal(true),
      isDisabled: false,
      shouldHide: selectedButNotClosed || isActionDisabledBasedOnRole(user?.id, space) || selected.every(e => e.locked),
      modal: lockFileModal,
      showModal: isShownLockFileModal,
    },
    {
      name: 'Unlock',
      type: 'modal',
      func: () => setUnlockFileModal(true),
      isDisabled: false,
      shouldHide: isActionDisabledBasedOnRole(user?.id, space) || selected.every(e => !e.locked),
      modal: unlockFileModal,
      showModal: isShownUnlockFileModal,
    },
    {
      name: 'Move',
      type: 'modal',
      func: () => setMoveFileModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => e.locked) || selected.some(e => !e.links.organize) || selectedButNotClosed,
      modal: moveFileModal,
      showModal: isShownMoveFileModal,
      shouldHide: !isAdmin && homeScope !== 'me' && isViewer,
    },
    {
      name: 'Copy to...',
      type: 'modal',
      func: () => setCopyToModal(true),
      isDisabled: selected.length === 0 || selectedButNotClosed || isActionDisabledBasedOnLocked(selected, user?.id, space),
      modal: copyToModal,
      showModal: isShownCopyToModal,
    },
    {
      name: 'Attach License',
      type: 'modal',
      func: () => setAttachLicensesModal(true),
      isDisabled: selected.length !== 1 || !availableLicenses || selectedButNotClosed,
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
      shouldHide: selected.length !== 1 || !!selected[0]?.file_license?.id || !availableLicenses,
    },
    {
      name: 'Detach License',
      type: 'modal',
      func: () => setDetachLicenseModal(true),
      isDisabled: selected.length !== 1 || !availableLicenses || selectedButNotClosed,
      modal: detachLicenseModal,
      showModal: isShownDetachLicenseModal,
      shouldHide: selected.length !== 1 || !selected[0]?.file_license?.id || !!selected[0]?.show_license_pending,
    },
    {
      name: 'Accept License',
      type: 'modal',
      func: () => setAcceptLicensesModal(true),
      modal: acceptLicensesModal,
      showModal: isShownAcceptLicensesModal,
      isDisabled: selectedButNotClosed,
      shouldHide: selected.length !== 1 || !selected[0]?.show_license_pending,
    },
    {
      name: 'Edit tags',
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: selectedButNotClosed || isFolder || selected.some(e => e.locked),
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || selected.length !== 1 || homeScope === 'spaces',
    },
    {
      name: 'Edit properties',
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: selectedButNotClosed || selected.length === 0 || selected.some(e => e.locked),
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.full_name) || homeScope === 'spaces',
    },
    {
      name: 'Comments',
      type: 'link',
      link: `/files/${selected[0]?.uid}/comments`,
      isDisabled: selectedButNotClosed || selected.length !== 1 || isFolder,
      shouldHide: selectedButNotClosed,
    },
    {
      name: 'Load into GSRS',
      type: 'link',
      isDisabled: selected.length !== 1 || !selected[0].tags.includes('GSRS'),
      link:
        selected.length === 1
          ? `/ginas/app/ui/substances/register?action=pfda-file-import&file-uri=${encodeURIComponent(`/api/files/${selected[0].uid}/${sanitizeFileName(selected[0].name)}?inline=true`)}`
          : '',
    },
  ]

  let filteredActions = actions
  if (homeScope === 'spaces') {
    const allowedNames = ['Open', 'Download', 'Rename', 'Copy to...', 'Comments', 'Delete']
    filteredActions = actions.filter(action => allowedNames.includes(action.name))
  }

  const modals = extractModalsFromActions(actions)

  return { actions: filteredActions, modals }
}
