import { pick } from 'ramda'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { RootState } from '../../../store'
import { IUser } from '../../../types/user'
import {
  OBJECT_TYPES,
  useAttachToModal,
} from '../actionModals/useAttachToModal'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useCopyToPrivateModal } from '../actionModals/useCopyToPrivateModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useAcceptLicensesModal } from '../licenses/useAcceptLicensesModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import { ActionFunctionsType, ResourceScope } from '../types'
import { useDeleteFileModal } from './actionModals/useDeleteFileModal'
import { useDownloadFileModal } from './actionModals/useDownloadFileModal'
import { useEditFileModal } from './actionModals/useEditFileModal'
import { useEditFolderModal } from './actionModals/useEditFolderModal'
import { useOpenFileModal } from './actionModals/useOpenFileModal'
import { useOrganizeFileModal } from './actionModals/useOrganizeFileModal'
import { copyFilesRequest, copyFilesToPrivate } from './files.api'
import { IFile } from './files.types'

export enum FileActions {
  'Track' = 'Track',
  'Open' = 'Open',
  'Download' = 'Download',
  'Edit file info' = 'Edit file info',
  'Edit folder info' = 'Edit folder info',
  'Make file public' = 'Make file public',
  // 'Make folder public' = 'Make folder public',
  'Feature' = 'Feature',
  'Unfeature' = 'Unfeature',
  'Delete' = 'Delete',
  'Organize' = 'Organize',
  'Copy to space' = 'Copy to space',
  'Copy to private' = 'Copy to private',
  'Attach to...' = 'Attach to...',
  'Attach License' = 'Attach License',
  'Detach License' = 'Detach License',
  'Request license approval' = 'Request license approval',
  'Accept License' = 'Accept License',
  'Edit tags' = 'Edit tags',
  'Comments' = 'Comments',
}

export const useFilesSelectActions = ({
  scope,
  fileId,
  spaceId,
  selectedItems,
  resourceKeys,
  resetSelected,
}: {
  scope?: ResourceScope
  spaceId?: string
  fileId: string
  selectedItems: IFile[]
  resourceKeys: string[]
  resetSelected?: () => void
}) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter(x => x !== undefined)
  const user: IUser = useSelector((state: RootState) => state.context.user)
  const isAdmin: boolean = user?.admin
  const openSelected = selected.some(e => e.state === 'open')

  const featureMutation = useFeatureMutation({
    resource: 'files',
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const {
    modalComp: openFileModal,
    setShowModal: setOpenFileModal,
    isShown: isShownOpenFileModal,
  } = useOpenFileModal(selected)
  const {
    modalComp: downloadModal,
    setShowModal: setDownloadModal,
    isShown: isShownDownloadModal,
  } = useDownloadFileModal(selected)
  const {
    modalComp: attachLicensesModal,
    setShowModal: setAttachLicensesModal,
    isShown: isShownAttachLicensesModal,
  } = useAttachLicensesModal<IFile>({
    selected: selected[0],
    resource: 'files',
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })
  const {
    modalComp: acceptLicensesModal,
    setShowModal: setAcceptLicensesModal,
    isShown: isShownAcceptLicensesModal,
  } = useAcceptLicensesModal<IFile>({
    selected: selected[0],
    resource: 'files',
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
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
      queryClient.invalidateQueries(resourceKeys)
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
    selected,
    // eslint-disable-next-line no-nested-ternary
    scope: scope ? (scope === 'me' ? 'private' : scope) : `space-${spaceId}`,
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
      if(spaceId) {
        history.push(`/spaces/${spaceId}/files`)
      } else {
        history.push('/home/files')
      }
      if(resetSelected) resetSelected()
    },
  })
  const {
    modalComp: organizeFileModal,
    setShowModal: setOrganizeFileModal,
    isShown: isShownOrganizeFileModal,
  } = useOrganizeFileModal({ selected, scope, spaceId, onSuccess: () => {
      if(resetSelected) resetSelected()
    }, 
  })
  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal({
    resource: 'files',
    selected,
    updateFunction: copyFilesRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })
  const {
    modalComp: copyToPrivateModal,
    setShowModal: setCopyToPrivateModal,
    isShown: isShownCopyToPrivateModal,
  } = useCopyToPrivateModal({
    resource: 'files',
    selected,
    request: copyFilesToPrivate,
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })
  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(
    selected.map(s => s.id),
    OBJECT_TYPES.FILE,
  )
  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IFile>({
    resource: 'files',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const availableLicenses = user?.links?.licenses ? user.links.licenses : false
  const isFolder = selected.every(e => e.type === 'Folder')

  let actions: ActionFunctionsType<FileActions> = {
    'Track': {
      func: () => {},
      link: selected[0]?.links?.track,
      isDisabled: selected.length !== 1 || !selected[0].links.track || openSelected,
    },
    'Open': {
      func: () => setOpenFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(
          e =>
            e.type === 'Folder' ||
            (e.type === 'UserFile' && !e.links.download) ||
            e.show_license_pending,
        ) ||
        openSelected,
      modal: openFileModal,
      showModal: isShownOpenFileModal,
    },
    'Download': {
      func: () => setDownloadModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(
          e =>
            e.type === 'Folder' ||
            (e.type === 'UserFile' && !e.links.download) ||
            e.show_license_pending,
        ) ||
        openSelected,
      modal: downloadModal,
      showModal: isShownDownloadModal,
    },
    'Edit file info': {
      func: () => setEditFileModal(true),
      modal: editFileModal,
      isDisabled:
        selected.length !== 1 || user.full_name !== selected[0].added_by,
      showModal: isShownEditFileModal,
      hide: isFolder || selected.length !== 1 || scope === 'spaces' || openSelected,
    },
    'Edit folder info': {
      func: () => setEditFolderModal(true),
      isDisabled: selected.length !== 1,
      modal: editFolderModal,
      showModal: isShownEditFolderModal,
      hide: !isFolder || selected.length !== 1 || scope === 'spaces',
    },
    'Make file public': {
      func: () => {},
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      },
      isDisabled: selected.length !== 1 || selected[0].location === 'Public',
      hide: isFolder || selected.length !== 1 || scope !== 'me' 
        || selected[0].links?.publish === undefined || openSelected,
    },
    // 'Make folder public': {
    //   func: () => {},
    //   link: {
    //     method: 'POST',
    //     url: `${selected[0]?.links?.publish}&scope=public`,
    //   },
    //   isDisabled: selected.length !== 1 || selected[0].location === 'Public' ,
    //   hide: !isFolder || selected.length !== 1
    // },
    'Feature': {
      func: () => {
        featureMutation.mutateAsync({
          featured: true,
          uids: selected.map(f => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled:
        selected.length === 0 ||
        !selected.every(e => !e.featured || !e.links.feature) ||
        openSelected,
      hide:
        scope !== 'everybody' ||
        selected.some(e => e.featured !== false) ||
        !isAdmin,
    },
    'Unfeature': {
      func: () => {
        featureMutation.mutateAsync({
          featured: false,
          uids: selected.map(f => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled:
        selected.length === 0 ||
        !selected.every(e => e.featured || !e.links.feature) ||
        openSelected,
      hide:
        selected.some(e => e.featured !== true) ||
        (scope !== 'everybody' && scope !== 'featured') ||
        !isAdmin,
    },
    'Delete': {
      func: () => setDeleteFileModal(true),
      isDisabled: selected.length === 0 ||
        selected.some(e => !e.links.remove),
      modal: deleteFileModal,
      showModal: isShownDeleteFileModal,
    },
    'Organize': {
      func: () => setOrganizeFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => !e.links.organize) ||
        openSelected,
      modal: organizeFileModal,
      showModal: isShownOrganizeFileModal,
      hide: !isAdmin && scope !== 'me',
    },
    'Copy to space': {
      func: () => setCopyToSpaceModal(true),
      isDisabled: selected.length === 0 ||
        selected.some(e => !e.links.copy) ||
        openSelected,
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Copy to private': {
      func: () => setCopyToPrivateModal(true),
      isDisabled: selected.length === 0,
      modal: copyToPrivateModal,
      showModal: isShownCopyToPrivateModal,
    },
    'Attach to...': {
      func: () => setAttachToModal(true),
      // TODO: filesAttachTo is missing
      isDisabled:
        selected.length === 0 ||
        selected.some(e => !e.links.attach_to) ||
        openSelected,
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    'Attach License': {
      func: () => setAttachLicensesModal(true),
      isDisabled:
        selected.length !== 1 ||
        !selected[0].links.license ||
        !availableLicenses ||
        openSelected,
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
      hide:
        selected.length !== 1 ||
        !selected[0]?.links?.license ||
        !availableLicenses,
    },
    'Detach License': {
      func: () => setDetachLicenseModal(true),
      isDisabled:
        selected.length !== 1 ||
        !selected[0].links.license ||
        !availableLicenses ||
        openSelected,
      modal: detachLicenseModal,
      showModal: isShownDetachLicenseModal,
      hide: selected.length !== 1 || !selected[0]?.links?.detach_license,
    },
    'Request license approval': {
      func: () => {},
      link: `/licenses/${selected[0]?.file_license?.id}/request_approval`,
      hide: !selected[0]?.links?.request_approval_license,
    },
    'Accept License': {
      func: () => setAcceptLicensesModal(true),
      modal: acceptLicensesModal,
      showModal: isShownAcceptLicensesModal,
      isDisabled: openSelected,
      hide: selected.length !== 1 || !selected[0]?.links?.accept_license_action,
    },
    'Edit tags': {
      func: () => setTagsModal(true),
      isDisabled: openSelected || isFolder,
      modal: tagsModal,
      showModal: isShownTagsModal,
      hide:
        (!isAdmin && selected[0]?.added_by !== user.full_name) ||
        selected.length !== 1 ||
        scope === 'spaces',
    },
    'Comments': {
      func: () => {},
      link: `/files/${selected[0]?.uid}/comments`,
    },
  }

  if (scope === 'spaces') {
    actions = pick(['Open', 'Download', 'Rename', 'Copy to space'], actions)
  }

  return actions
}
