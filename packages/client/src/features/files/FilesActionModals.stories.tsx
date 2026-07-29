import type { Meta, StoryObj } from '@storybook/react-vite'
import { useQueryClient } from '@tanstack/react-query'
import { HttpResponse, http } from 'msw'
import type React from 'react'
import { useEffect } from 'react'
import { WithListData } from '../../stories/helpers'
import { StorybookProviders } from '../../stories/StorybookProviders'
import type { DownloadListResponse, ServerScope } from '../home/types'
import { useAddFolderModal } from './actionModals/useAddFolderModal'
import { useConfirmModal } from './actionModals/useConfirmModal'
import { useCopyFilesModal } from './actionModals/useCopyFilesModal'
import { useCopyFilesToSpaceModal } from './actionModals/useCopyFilesToSpaceModal'
import { useDeleteFileModal } from './actionModals/useDeleteFileModal'
import { useDnDMoveFileModal } from './actionModals/useDnDMoveFileModal'
import { useDownloadFileModal } from './actionModals/useDownloadFileModal'
import { useEditFileModal } from './actionModals/useEditFileModal'
import { useEditFolderModal } from './actionModals/useEditFolderModal'
import { useFileUploadModalContext } from './actionModals/useFileUploadModal'
import { useLockUnlockFileModal } from './actionModals/useLockUnlockFileModal'
import { useOpenFileModal } from './actionModals/useOpenFileModal'
import { useOptionAddFileModal } from './actionModals/useOptionAddFileModal'
import { useSelectFileModal } from './actionModals/useSelectFileModal'
import { useSelectFolderModal } from './actionModals/useSelectFolderModal'
import { fetchFiles } from './files.api'
import type { IFile, IFolder, SelectedNode } from './files.types'

const meta: Meta = {
  title: 'Modals/Files',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  data: { id: string }[]
}
type Story = StoryObj<Props>

const exampleDeleteFiles: IFile[] = Array.from({ length: 8 }, (_, index) => {
  const id = index + 1

  return {
    id,
    uid: `file-delete-example-${id}`,
    name: `patient-${id}-analysis-${id % 2 === 0 ? 'rna-seq' : 'exome'}-results.fastq.gz`,
    type: 'UserFile',
    stiType: 'UserFile',
    locked: false,
    resource: false,
    locking: false,
    state: 'closed',
    location: 'Private',
    addedBy: 'Storybook User',
    createdAt: '2026-06-24',
    featured: false,
    scope: 'private',
    spaceId: null,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    fileSize: `${120 + id * 18} MB`,
    createdAtDateTime: '2026-06-24T12:00:00Z',
    description: null,
    show_license_pending: false,
  }
}) satisfies IFile[]

const exampleDeleteDownloadList: DownloadListResponse[] = exampleDeleteFiles.map(file => ({
  id: file.id,
  uid: file.uid,
  name: file.name,
  type: 'file',
  fsPath: `/private/projects/cohort-2026/sequencing/run-${String(file.id).padStart(2, '0')}/${file.name}`,
  viewURL: `/home/files/${file.uid}`,
  downloadURL: `/api/files/${file.uid}/download`,
  locked: file.locked,
}))

const exampleDownloadFiles: IFile[] = exampleDeleteFiles.map(file => ({
  ...file,
  uid: file.uid.replace('delete', 'download'),
  name: file.name.replace('analysis', 'download'),
}))

const exampleDownloadList: DownloadListResponse[] = exampleDownloadFiles.map(file => ({
  id: file.id,
  uid: file.uid,
  name: file.name,
  type: 'file',
  fsPath: `/private/projects/cohort-2026/deliverables/run-${String(file.id).padStart(2, '0')}/${file.name}`,
  viewURL: `/home/files/${file.uid}`,
  downloadURL: `/api/files/${file.uid}/download`,
  locked: file.locked,
}))

const exampleOpenFiles: IFile[] = Array.from({ length: 10 }, (_, index) => {
  const id = index + 1

  return {
    ...exampleDeleteFiles[index % exampleDeleteFiles.length],
    id,
    uid: `file-open-example-${id}`,
    name: `open-preview-${String(id).padStart(2, '0')}-${id % 2 === 0 ? 'report.pdf' : 'metrics.tsv'}`,
  }
}) satisfies IFile[]

const exampleOpenDownloadList: DownloadListResponse[] = exampleOpenFiles.map(file => ({
  id: file.id,
  uid: file.uid,
  name: file.name,
  type: 'file',
  fsPath: `/private/projects/cohort-2026/review/previews/${file.name}`,
  viewURL: `/home/files/${file.uid}`,
  downloadURL: `/api/files/${file.uid}/download`,
  locked: file.locked,
}))

const exampleLockFiles: IFile[] = Array.from({ length: 10 }, (_, index) => {
  const id = index + 1

  return {
    ...exampleDeleteFiles[index % exampleDeleteFiles.length],
    id,
    uid: `file-lock-example-${id}`,
    name: `lock-candidate-${String(id).padStart(2, '0')}-${id % 2 === 0 ? 'clinical-report.pdf' : 'variants.vcf.gz'}`,
    locked: false,
  }
}) satisfies IFile[]

const exampleUnlockFiles: IFile[] = Array.from({ length: 10 }, (_, index) => {
  const id = index + 1

  return {
    ...exampleDeleteFiles[index % exampleDeleteFiles.length],
    id,
    uid: `file-unlock-example-${id}`,
    name: `unlock-candidate-${String(id).padStart(2, '0')}-${id % 2 === 0 ? 'sequencing-qc.tsv' : 'reads.fastq.gz'}`,
    locked: true,
  }
}) satisfies IFile[]

const exampleLockDownloadList: DownloadListResponse[] = exampleLockFiles.map(file => ({
  id: file.id,
  uid: file.uid,
  name: file.name,
  type: 'file',
  fsPath: `/private/projects/cohort-2026/lock-review/run-${String(file.id).padStart(2, '0')}/${file.name}`,
  viewURL: `/home/files/${file.uid}`,
  downloadURL: `/api/files/${file.uid}/download`,
  locked: file.locked,
}))

const exampleUnlockDownloadList: DownloadListResponse[] = exampleUnlockFiles.map(file => ({
  id: file.id,
  uid: file.uid,
  name: file.name,
  type: 'file',
  fsPath: `/private/projects/cohort-2026/unlock-review/run-${String(file.id).padStart(2, '0')}/${file.name}`,
  viewURL: `/home/files/${file.uid}`,
  downloadURL: `/api/files/${file.uid}/download`,
  locked: file.locked,
}))

const lockFileHandlers = [
  http.post('/api/files/download_list', () => HttpResponse.json(exampleLockDownloadList)),
  http.post('/api/nodes/lock', () => HttpResponse.json({ message: { type: 'success', text: 'Files locked' } })),
]

const unlockFileHandlers = [
  http.post('/api/files/download_list', () => HttpResponse.json(exampleUnlockDownloadList)),
  http.post('/api/nodes/unlock', () => HttpResponse.json({ message: { type: 'success', text: 'Files unlocked' } })),
]

const exampleCopySelectedNodes: SelectedNode[] = [
  {
    id: 101,
    name: 'tumor-normal-pair-17.annotated.vcf.gz',
    sourceScope: 'private',
    sourceScopePath: '/private/cohort-2026/variant-calling/tumor-normal-pair-17.annotated.vcf.gz',
    type: 'UserFile',
    sourceFolderId: 501,
    state: 'closed',
    uid: 'file-copy-example-101',
    isCopied: false,
  },
  {
    id: 201,
    name: 'rna-seq-qc-reports',
    sourceScope: 'private',
    sourceScopePath: '/private/cohort-2026/rna-seq-qc-reports',
    type: 'Folder',
    sourceFolderId: 502,
    isCopied: false,
    children: [
      {
        id: 202,
        name: 'sample-2048-fastqc.html',
        sourceScope: 'private',
        sourceScopePath: '/private/cohort-2026/rna-seq-qc-reports/sample-2048-fastqc.html',
        type: 'UserFile',
        sourceFolderId: 201,
        state: 'closed',
        uid: 'file-copy-example-202',
        isCopied: false,
      },
      {
        id: 203,
        name: 'sample-2048-alignment-summary.tsv',
        sourceScope: 'private',
        sourceScopePath: '/private/cohort-2026/rna-seq-qc-reports/sample-2048-alignment-summary.tsv',
        type: 'UserFile',
        sourceFolderId: 201,
        state: 'closed',
        uid: 'file-copy-example-203',
        isCopied: false,
      },
    ],
  },
]

const exampleCopySelectedIds = exampleCopySelectedNodes.map(node => node.id)

const exampleCopyTargetFolders: IFolder[] = [
  {
    id: 701,
    name: 'Sequencing Review Packet',
    type: 'Folder',
    stiType: 'Folder',
    locked: false,
    location: 'Private',
    origin: null,
    addedBy: 'Storybook User',
    createdAt: '2026-06-24',
    featured: false,
    scope: 'space-42',
    spaceId: '42',
    tags: [],
    properties: {},
    createdAtDateTime: '2026-06-24T12:00:00Z',
    state: null,
    path: [{ id: 701, name: 'Sequencing Review Packet' }],
  },
  {
    id: 702,
    name: 'External Collaborator Handoff',
    type: 'Folder',
    stiType: 'Folder',
    locked: false,
    location: 'Private',
    origin: null,
    addedBy: 'Storybook User',
    createdAt: '2026-06-24',
    featured: false,
    scope: 'space-42',
    spaceId: '42',
    tags: [],
    properties: {},
    createdAtDateTime: '2026-06-24T12:00:00Z',
    state: null,
    path: [{ id: 702, name: 'External Collaborator Handoff' }],
  },
]

const copyFilesModalHandlers = [
  http.get('/api/v2/files/selected', () => HttpResponse.json(exampleCopySelectedNodes)),
  http.post('/api/v2/files/copy/validate', () =>
    HttpResponse.json({
      'file-copy-example-202': {
        uid: 'file-copy-existing-202',
        targetScopePath: '/spaces/42/files/Sequencing Review Packet/sample-2048-fastqc.html',
      },
    }),
  ),
  http.post('/api/v2/nodes/copy', () => HttpResponse.json({ message: { type: 'success', text: 'Copy started' } })),
  http.get('/api/v2/folders/children', () => HttpResponse.json(exampleCopyTargetFolders)),
  http.get('/api/v2/spaces/editable', () =>
    HttpResponse.json([
      {
        scope: 'space-42',
        name: 'Precision Oncology Review',
        title: 'Precision Oncology Review',
        type: 'review',
        protected: true,
        restrictedReviewer: false,
      },
      {
        scope: 'space-64',
        name: 'RNA Sequencing Collaboration',
        title: 'RNA Sequencing Collaboration',
        type: 'groups',
        protected: false,
        restrictedReviewer: false,
      },
    ]),
  ),
]

const exampleSelectFiles: IFile[] = Array.from({ length: 10 }, (_, index) => {
  const id = index + 1

  return {
    ...exampleDeleteFiles[index % exampleDeleteFiles.length],
    id,
    uid: `file-select-example-${id}`,
    name: `selectable-file-${String(id).padStart(2, '0')}-${id % 2 === 0 ? 'variants.vcf' : 'reads.fastq.gz'}`,
  }
}) satisfies IFile[]

const selectFileHandlers = [
  http.get('/api/v2/files', ({ request }) => {
    const url = new URL(request.url)
    const uidParam = url.searchParams.get('uids')
    const requestedUids = uidParam?.split(',').filter(Boolean)
    const files = requestedUids?.length
      ? exampleSelectFiles.filter(file => requestedUids.includes(file.uid))
      : exampleSelectFiles

    return HttpResponse.json({
      data: files,
      meta: { page: 1, pageSize: 20, total: files.length, totalPages: 1 },
    })
  }),
  http.get('/api/spaces/', () =>
    HttpResponse.json({
      data: [],
      meta: { page: 1, pageSize: 1000, total: 0, totalPages: 1 },
    }),
  ),
]

const AddFolderModalWrapper = () => {
  const { modalComp, setShowModal } = useAddFolderModal({
    folderId: '1',
    spaceId: '1',
    isAllowed: true,
    onViolation: () => {},
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const AddFolderModal: Story = {
  render: () => <AddFolderModalWrapper />,
}

const FileUploadModalWrapper = () => {
  const { openModal } = useFileUploadModalContext()
  useEffect(() => {
    openModal({
      folderId: '1',
      spaceId: '1',
    })
  }, [])
  return <div style={{ padding: 20 }}>The File Upload Modal should be open.</div>
}
export const FileUploadModal: Story = {
  render: () => <FileUploadModalWrapper />,
}

const CopyFilesModalWrapper = () => {
  const { modalComp, setShowModal } = useCopyFilesToSpaceModal({ spaceId: '1' })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const CopyFilesModal: Story = {
  render: () => <CopyFilesModalWrapper />,
}

const DownloadFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useDownloadFileModal(data?.files || [], 'private')
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}
export const DownloadFileModal: Story = {
  parameters: {
    msw: {
      handlers: [http.post('/api/files/download_list', () => HttpResponse.json(exampleDownloadList))],
    },
  },
  render: () => <DownloadFileModalWrapper data={{ files: exampleDownloadFiles }} />,
}

const EditFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useEditFileModal(data?.files?.[1] || data?.files?.[0])
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <EditFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const OpenFilesModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const result = useOpenFileModal(data?.files || [])
  const { modalComp, setShowModal } = result as {
    modalComp: React.ReactElement
    setShowModal: (val: boolean) => void
    isShown: boolean
  }
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const OpenFilesModal: Story = {
  parameters: {
    msw: {
      handlers: [http.post('/api/files/download_list', () => HttpResponse.json(exampleOpenDownloadList))],
    },
  },
  render: () => <OpenFilesModalWrapper data={{ files: exampleOpenFiles }} />,
}

const ValidateCopiedFilesModalWrapper = ({ sourceScopes, ids }: { sourceScopes: ServerScope[]; ids: number[] }) => {
  const queryClient = useQueryClient()
  const { modalComp, setShowModal } = useCopyFilesModal({ sourceScopes, selectedIds: ids })
  useEffect(() => {
    queryClient.setQueryData(['copyingFiles', ids], exampleCopySelectedNodes)
    setShowModal(true)
  }, [ids, queryClient, setShowModal])
  return modalComp
}

export const ValidateCopiedFilesModal: Story = {
  parameters: {
    msw: {
      handlers: copyFilesModalHandlers,
    },
  },
  render: () => <ValidateCopiedFilesModalWrapper sourceScopes={['private']} ids={exampleCopySelectedIds} />,
}

export const CopyFilesValidationModal: Story = {
  name: 'Copy Files Validation Modal',
  parameters: {
    msw: {
      handlers: copyFilesModalHandlers,
    },
  },
  render: () => <ValidateCopiedFilesModalWrapper sourceScopes={['private']} ids={exampleCopySelectedIds} />,
}

const DeleteFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useDeleteFileModal({
    selected: data?.files || [],
    onSuccess: () => {},
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const DeleteFileModal: Story = {
  parameters: {
    msw: {
      handlers: [http.post('/api/files/download_list', () => HttpResponse.json(exampleDeleteDownloadList))],
    },
  },
  render: () => <DeleteFileModalWrapper data={{ files: exampleDeleteFiles }} />,
}

const EditFolderModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const folder = data?.files?.find(f => f.type === 'Folder') || data?.files?.[0]
  const { modalComp, setShowModal } = useEditFolderModal(folder)
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const EditFolderModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <EditFolderModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const DnDMoveFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, openModal } = useDnDMoveFileModal({
    spaceId: 1,
    selected: data?.files || [],
    onSuccess: () => {},
    onCanceled: () => {},
  })
  useEffect(() => {
    openModal({ id: 1, name: 'Target Folder' })
  }, [])
  return modalComp
}

export const DnDMoveFileModal: Story = {
  render: () => (
    <WithListData resource="files" fetchList={fetchFiles}>
      {({ data }) => <DnDMoveFileModalWrapper data={data as { files: IFile[] }} />}
    </WithListData>
  ),
}

const LockFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useLockUnlockFileModal({
    selected: data?.files || [],
    onSuccess: () => {},
    scope: 'private',
    type: 'lock',
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const LockFileModal: Story = {
  parameters: {
    msw: {
      handlers: lockFileHandlers,
    },
  },
  render: () => <LockFileModalWrapper data={{ files: exampleLockFiles }} />,
}

const UnlockFileModalWrapper = ({ data }: { data: { files: IFile[] } }) => {
  const { modalComp, setShowModal } = useLockUnlockFileModal({
    selected: data?.files || [],
    onSuccess: () => {},
    scope: 'private',
    type: 'unlock',
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const UnlockFileModal: Story = {
  parameters: {
    msw: {
      handlers: unlockFileHandlers,
    },
  },
  render: () => <UnlockFileModalWrapper data={{ files: exampleUnlockFiles }} />,
}

const SelectFileModalWrapper = () => {
  const { modalComp, setShowModal } = useSelectFileModal(
    'Select Files',
    'checkbox',
    files => {
      console.log('Selected files:', files)
    },
    undefined,
    ['private', 'public'],
    [],
    false,
  )
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const SelectFileModal: Story = {
  parameters: {
    msw: {
      handlers: selectFileHandlers,
    },
  },
  render: () => <SelectFileModalWrapper />,
}

const SelectFolderModalWrapper = () => {
  const { modalComp, setShowModal } = useSelectFolderModal({
    headerText: 'Select Folder',
    submitCaption: 'Select',
    scope: 'private',
    onHandleSubmit: (folderId, info) => {
      console.log('Selected folder:', folderId, info)
    },
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const SelectFolderModal: Story = {
  render: () => <SelectFolderModalWrapper />,
}

const ConfirmModalWrapper = () => {
  const { modalComp, setShowModal } = useConfirmModal(
    'Confirm Action',
    'Are you sure you want to proceed with this action?',
    () => {
      console.log('Confirmed!')
    },
  )
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const ConfirmModal: Story = {
  render: () => <ConfirmModalWrapper />,
}

const OptionAddFileModalWrapper = () => {
  const { modalComp, setShowModal } = useOptionAddFileModal({
    openFileUploadModal: () => console.log('Upload modal opened'),
    setShowCopyFilesModal: show => console.log('Copy modal:', show),
  })
  useEffect(() => {
    setShowModal(true)
  }, [])
  return modalComp
}

export const OptionAddFileModal: Story = {
  render: () => <OptionAddFileModalWrapper />,
}

export default meta
