import { pick } from 'ramda'
import { useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router'
import { useAuthUser } from '../../auth/useAuthUser'
import { ISpace } from '../../spaces/spaces.types'
import { useAttachToModal } from '../actionModals/useAttachToModal'
import { useCopyToPrivateModal } from '../actionModals/useCopyToPrivateModal'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useAcceptLicenseModal } from '../licenses/useAcceptLicenseModal'
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
import { isActionDisabledBasedOnProtected, isActionDisabledBasedOnRole } from '../../spaces/common'
import { useLockUnlockFileModal } from './actionModals/useLockUnlockFileModal'

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
  'Copy to My Home (private)' = 'Copy to My Home (private)',
  'Attach to...' = 'Attach to...',
  'Attach License' = 'Attach License',
  'Detach License' = 'Detach License',
  'Request license approval' = 'Request license approval',
  'Accept License' = 'Accept License',
  'Edit tags' = 'Edit tags',
  'Lock' = 'Lock',
  'Unlock' = 'Unlock',
  'Comments' = 'Comments',
}

const getFileScope = (
  scope: ResourceScope | undefined,
  space: ISpace | undefined,
): string => {
  if (scope) {
    switch (scope) {
      case 'me':
        return 'private'
      case 'everybody':
        return 'public'
      case 'featured':
        return 'public'
      default:
        return scope
    }
  }
  return `space-${space?.id}`
}

const isInSpace = (scope?: ResourceScope) =>
  !(scope && (scope === 'me' || scope === 'everybody' || scope === 'featured'))

export const useFilesSelectActions = ({
  scope,
  folderId,
  space,
  selectedItems,
  resourceKeys,
  resetSelected,
}: {
  scope?: ResourceScope;
  space?: ISpace;
  folderId?: string;
  selectedItems: IFile[];
  resourceKeys: string[];
  resetSelected?: () => void;
}) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter((x) => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user?.admin
  const isViewer = space?.current_user_membership.role === 'viewer'
  const openSelected = selected.some((e) => e.state === 'open')

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
  } = useAcceptLicenseModal<IFile>({
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
    selected: selected.filter((e) => !e.locked),
    scope: getFileScope(scope, space),
    onSuccess: () => {
      if (space) {
        if (folderId) {
          history.push(`/spaces/${space.id}/files?folder_id=${folderId}`)
          queryClient.invalidateQueries(['files', folderId])
        } else {
          history.push(`/spaces/${space.id}/files`)
          queryClient.invalidateQueries(['files'])
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (folderId) {
          history.push(`/home/files?folder_id=${folderId}`)
          queryClient.invalidateQueries(['files', folderId])
        } else {
          history.push('/home/files')
          queryClient.invalidateQueries(['files'])
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
    selected: selected.filter((e) => e.locked),
    scope: getFileScope(scope, space),
    type: 'unlock',
    spaceId: space?.id,
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
    selected: selected.filter((e) => !e.locked),
    scope: getFileScope(scope, space),
    type: 'lock',
    spaceId: space?.id,
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
    selected,
    scope,
    spaceId: space?.id,
    onSuccess: () => {
      if (resetSelected) resetSelected()
    },
  })
  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal({
    spaceId: space?.id,
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
    selected.map((s) => s.id),
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
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const availableLicenses = user?.links?.licenses ? user.links.licenses : false
  const isFolder = selected.every((e) => e.type === 'Folder')

  let actions: ActionFunctionsType<FileActions> = {
    Track: {
      type: 'link',
      link: selected[0]?.links?.track || '',
      isDisabled:
        selected.length !== 1 || !selected[0].links.track || openSelected,
    },
    'Open': {
      type: 'modal',
      func: () => setOpenFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some((e) => e.locked) ||
        isActionDisabledBasedOnProtected(user?.id as number, space) ||
        selected.some(
          (e) =>
            e.type === 'Folder' ||
            (e.type === 'UserFile' && !e.links.download) ||
            e.show_license_pending,
        ) ||
        openSelected,
      modal: openFileModal,
      showModal: isShownOpenFileModal,
    },
    'Download': {
      type: 'modal',
      func: () => setDownloadModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some((e) => e.locked) ||
        isActionDisabledBasedOnProtected(user?.id as number, space) ||
        selected.some(
          (e) =>
            e.type === 'Folder' ||
            (e.type === 'UserFile' && !e.links.download) ||
            e.show_license_pending,
        ) ||
        openSelected,
      modal: downloadModal,
      showModal: isShownDownloadModal,
    },
    'Edit file info': {
      type: 'modal',
      func: () => setEditFileModal(true),
      modal: editFileModal,
      isDisabled:
        selected.length !== 1 ||
        user?.full_name !== selected[0].added_by ||
        selected.some((e) => e.locked),
      showModal: isShownEditFileModal,
      shouldHide:
        isFolder || selected.length !== 1 || scope === 'spaces' || openSelected,
    },
    'Edit folder info': {
      type: 'modal',
      func: () => setEditFolderModal(true),
      isDisabled: selected.length !== 1 || selected.some((e) => e.locked),
      modal: editFolderModal,
      showModal: isShownEditFolderModal,
      shouldHide: !isFolder || selected.length !== 1 || scope === 'spaces',
    },
    'Make file public': {
      type: 'link',
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      },
      isDisabled: selected.length !== 1 || selected[0].location === 'Public',
      shouldHide:
        isFolder ||
        selected.length !== 1 ||
        scope !== 'me' ||
        selected[0].links?.publish === undefined ||
        openSelected,
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
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({
          featured: true,
          uids: selected.map((f) => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled:
        selected.length === 0 ||
        !selected.every((e) => !e.featured || !e.links.feature) ||
        openSelected,
      shouldHide:
        scope !== 'everybody' ||
        selected.some((e) => e.featured !== false) ||
        !isAdmin,
    },
    'Unfeature': {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({
          featured: false,
          uids: selected.map((f) => (f.type === 'Folder' ? f.id : f.uid)),
        })
      },
      isDisabled:
        selected.length === 0 ||
        !selected.every((e) => e.featured || !e.links.feature) ||
        openSelected,
      shouldHide:
        selected.some((e) => e.featured !== true) ||
        (scope !== 'everybody' && scope !== 'featured') ||
        !isAdmin,
    },
    'Delete': {
      type: 'modal',
      func: () => setDeleteFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some((e) => !e.links.remove) ||
        isActionDisabledBasedOnProtected(user?.id as number, space) || selected.every((e) => e.locked),
      shouldHide: isViewer,
      modal: deleteFileModal,
      showModal: isShownDeleteFileModal,
    },
    'Lock': {
      type: 'modal',
      func: () => setLockFileModal(true),
      isDisabled: false,
      shouldHide:
      isActionDisabledBasedOnRole(user?.id as number, space) || selected.every((e) => e.locked),
      modal: lockFileModal,
      showModal: isShownLockFileModal,
    },
    'Unlock': {
      type: 'modal',
      func: () => setUnlockFileModal(true),
      isDisabled: false,
      shouldHide:
      isActionDisabledBasedOnRole(user?.id as number, space) || selected.every((e) => !e.locked),
      modal: unlockFileModal,
      showModal: isShownUnlockFileModal,
    },
    'Organize': {
      type: 'modal',
      func: () => setOrganizeFileModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some((e) => e.locked) ||
        selected.some((e) => !e.links.organize) ||
        openSelected,
      modal: organizeFileModal,
      showModal: isShownOrganizeFileModal,
      shouldHide: !isAdmin && scope !== 'me' && isViewer,
    },
    'Copy to space': {
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some((e) => !e.links.copy) ||
        openSelected,
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
      shouldHide: isViewer,
    },
    'Copy to My Home (private)': {
      type: 'modal',
      func: () => setCopyToPrivateModal(true),
      isDisabled:
        selected.length === 0 ||
        isActionDisabledBasedOnProtected(user?.id as number, space),
      modal: copyToPrivateModal,
      showModal: isShownCopyToPrivateModal,
      shouldHide: !isInSpace(scope),
    },
    'Attach to...': {
      type: 'modal',
      func: () => setAttachToModal(true),
      // TODO: filesAttachTo is missing
      isDisabled:
        selected.length === 0 ||
        selected.some((e) => !e.links.attach_to) ||
        openSelected,
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    'Attach License': {
      type: 'modal',
      func: () => setAttachLicensesModal(true),
      isDisabled:
        selected.length !== 1 ||
        !selected[0].links.license ||
        !availableLicenses ||
        openSelected,
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
      shouldHide:
        selected.length !== 1 ||
        !selected[0]?.links?.license ||
        !availableLicenses,
    },
    'Detach License': {
      type: 'modal',
      func: () => setDetachLicenseModal(true),
      isDisabled:
        selected.length !== 1 ||
        !selected[0].links.license ||
        !availableLicenses ||
        openSelected,
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
      shouldHide:
        selected.length !== 1 || !selected[0]?.links?.accept_license_action,
    },
    'Edit tags': {
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: openSelected || isFolder || selected.some((e) => e.locked),
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide:
        (!isAdmin && selected[0]?.added_by !== user?.full_name) ||
        selected.length !== 1 ||
        scope === 'spaces',
    },
    'Comments': {
      type: 'link',
      link: `/files/${selected[0]?.uid}/comments`,
    },
  }

  if (scope === 'spaces') {
    actions = pick(['Open', 'Download', 'Rename', 'Copy to space'], actions)
  }

  return actions
}
