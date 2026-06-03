import { HttpResponse, http } from 'msw'
import { indexBy } from 'ramda'
import type { FetchFilesQuery, FetchFolderChildrenResponse } from '../../features/files/files.api'
import type { IFile, IFolder } from '../../features/files/files.types'

export const mockExportInputFiles: IFile[] = [
  {
    id: 1,
    uid: 'file-FGpkXb80xbPGbqJX4xjjGQ47',
    name: 'test-input.txt',
    size: '1.2 KB',
    type: 'File',
    locked: false,
    resource: false,
    locking: false,
    state: 'closed',
    location: 'Private',
    addedBy: 'user@example.com',
    createdAt: '2024-01-01T10:00:00Z',
    featured: false,
    scope: 'private',
    spaceId: null,
    origin: {
      text: 'Uploaded',
      fa: 'fa-upload',
      href: '/uploads/file-FGpkXb80xbPGbqJX4xjjGQ47',
    },
    tags: ['input', 'test'],
    properties: {
      format: 'TXT',
      encoding: 'UTF-8',
    },
    fileSize: '1.2 KB',
    createdAtDateTime: '2024-01-01T10:00:00Z',
    description: 'Test input file for export modal',
    fileLicense: {
      id: '1',
      title: 'Test License',
      uid: 'license-test-123',
    },
    show_license_pending: false,
    private: true,
    public: false,
    user: {
      dxuser: 'test.user',
      full_name: 'Test User',
    },
    org: {
      handle: 'test-org',
      name: 'Test Organization',
    },
  },
]

export const mockExportInputData = {
  input_file: 'file-FGpkXb80xbPGbqJX4xjjGQ47',
  parameter1: 'test_value',
  parameter2: 42,
  options: {
    memory: '8GB',
    cpus: 4,
  },
}

const folders = [
  {
    id: 11,
    name: 'Most Important',
    type: 'Folder',
    stiType: 'Folder',
    state: null,
    location: 'Private',
    addedBy: 'Randall Ebert',
    createdAt: '01/23/2024',
    featured: false,
    scope: 'private',
    origin: 'Created',
    spaceId: null,
    locked: false,
    tags: [],
    properties: {},
    path: [
      { id: 14, name: 'Most Important' },
      { id: null, name: '/' },
    ],
    createdAtDateTime: '2024-01-23 13:51:19 CET',
    originObject: { originType: 'User', originUid: 'user-7' },
  },
] satisfies IFolder[]

const spaceFolders = [
  {
    id: 212,
    name: 'copied',
    type: 'Folder',
    stiType: 'Folder',
    state: null,
    location: 'group - Shared',
    addedBy: 'Sirius Black',
    createdAt: '06/03/2024',
    featured: false,
    scope: 'space-32',
    spaceId: 'space-32',
    locked: false,
    origin: null,
    tags: [],
    properties: {},
    path: [
      { id: 212, name: 'copied' },
      { id: null, name: '/' },
    ],
    createdAtDateTime: '2024-06-03 08:21:25 UTC',
    originObject: { originType: 'Folder', originUid: null },
  },
  {
    id: 220,
    name: 'test_sync_folder',
    type: 'Folder',
    stiType: 'Folder',
    state: null,
    location: 'group - Shared',
    addedBy: 'John pfda_autotest1',
    createdAt: '06/05/2024',
    featured: false,
    scope: 'space-32',
    spaceId: 'space-32',
    locked: false,
    origin: null,
    tags: [],
    properties: {},
    path: [
      { id: 220, name: 'test_sync_folder' },
      { id: null, name: '/' },
    ],
    createdAtDateTime: '2024-06-05 09:35:12 UTC',
    originObject: { originType: 'Folder', originUid: null },
  },
] satisfies IFolder[]

const files = [
  {
    id: 9,
    name: 'CI_Patient1_ExomeSeq_2024-01-18.fastq.gz',
    type: 'UserFile',
    stiType: 'UserFile',
    state: 'closed',
    location: 'Private',
    addedBy: 'Dr. Leon Voss',
    createdAt: '11/30/2023',
    featured: false,
    scope: 'private',
    spaceId: null,
    locked: false,
    resource: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-ArZB34Q0ZkG51XVbFKkjKj52-1',
    fileSize: '310 KB',
    createdAtDateTime: '2023-11-30 15:52:02 CET',
    description: null,
    show_license_pending: false,
    originObject: { originType: 'User', originUid: 'user-7' },
  },
  {
    id: 8,
    name: 'CI_Patient2_RNASeq_Batch3_2024-01-18.fastq.gz',
    type: 'UserFile',
    stiType: 'UserFile',
    state: 'closed',
    location: 'Private',
    addedBy: 'Dr. Leon Voss',
    createdAt: '11/30/2023',
    featured: false,
    scope: 'private',
    spaceId: null,
    locked: false,
    resource: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-ObZB33j0ZkG7FjJq36FBz4z7-1',
    fileSize: '197 KB',
    createdAtDateTime: '2023-11-30 15:51:59 CET',
    description: null,
    show_license_pending: false,
    originObject: { originType: 'User', originUid: 'user-7' },
  },
  {
    id: 7,
    name: 'CI_Patient3_GenomeSeq_Run5_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    addedBy: 'Dr. Leon Voss',
    createdAt: '11/30/2023',
    featured: false,
    scope: 'private',
    spaceId: null,
    locked: false,
    resource: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-GbZB3300ZkG3gzZG1xK1Pp10-1',
    fileSize: '240 KB',
    createdAtDateTime: '2023-11-30 15:51:56 CET',
    description: null,
    show_license_pending: false,
    originObject: { originType: 'User', originUid: 'user-7' },
  },
  {
    id: 6,
    name: 'CI_Patient4_Metagenomics_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    addedBy: 'Dr. Leon Voss',
    createdAt: '11/30/2023',
    featured: false,
    scope: 'private',
    spaceId: null,
    locked: false,
    resource: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-GbZB32Q0ZkGB7y6zvVk68pJJ-1',
    fileSize: '82.9 KB',
    createdAtDateTime: '2023-11-30 15:51:54 CET',
    description: null,
    show_license_pending: false,
    originObject: { originType: 'User', originUid: 'user-7' },
  },
  {
    id: 3,
    name: 'CI_Patient5_TranscriptomeSeq_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    addedBy: 'Dr. Leon Voss',
    createdAt: '11/28/2023',
    featured: false,
    scope: 'private',
    spaceId: null,
    locked: false,
    resource: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzGk-1',
    fileSize: '240 KB',
    createdAtDateTime: '2023-11-28 10:34:45 CET',
    description: null,
    show_license_pending: false,
    originObject: { originType: 'User', originUid: 'user-7' },
  },
] satisfies IFile[]

const copyingNodes = [
  {
    id: 1,
    name: 'CI_Patient1_TranscriptomeSeq_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    addedBy: 'Dr. Leon Voss',
    scope: 'space-1',
    locked: false,
    uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzIk-1',
    sourceScopePath: '/test_folder',
  },
  {
    id: 2,
    type: 'Folder',
    name: 'test_folder',
    children: [
      {
        id: 3,
        name: 'CI_Patient21_TranscriptomeSeq_2024-01-18.fastq.gz',
        type: 'UserFile',
        state: 'closed',
        addedBy: 'Dr. Leon Voss',
        scope: 'space-1',
        locked: false,
        uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzHk-1',
        sourceScopePath: '/test_folder',
      },
      {
        id: 4,
        name: 'CI_Patient22_TranscriptomeSeq_2024-01-18.fastq.gz',
        type: 'UserFile',
        state: 'closed',
        addedBy: 'Dr. Leon Voss',
        scope: 'space-1',
        locked: false,
        uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzGi-1',
        sourceScopePath: '/test_folder/test',
      },
      {
        id: 5,
        name: 'CI_Patient23_TranscriptomeSeq_2024-01-18.fastq.gz',
        type: 'UserFile',
        state: 'closed',
        addedBy: 'Dr. Leon Voss',
        scope: 'space-1',
        locked: false,
        uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzGl-1',
        sourceScopePath: '/test_folder/test',
      },
    ],
  },
]

const existingFiles = {
  'file-GbXq8J80ZkG7Yq5KQ3fXYzHk-1': {
    uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzGk-2',
    targetScopePath: '/test_folder',
  },
  'file-GbXq8J80ZkG7Yq5KQ3fXYzGi-1': {
    uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzGk-2',
    targetScopePath: '/test_folder',
  },
}

export const filesByUid = indexBy(s => s.uid, files)

export const filesMocks = [
  http.get('/api/v2/files/selected', () =>
    HttpResponse.json([...copyingNodes], {
      status: 200,
    }),
  ),
  http.get('/api/v2/files/:uid', ({ params: { uid } }) =>
    HttpResponse.json<IFile>(filesByUid[uid as string], { status: 200 }),
  ),
  http.get('/api/files*', () =>
    HttpResponse.json<FetchFilesQuery>(
      {
        files: [...folders, ...files],
        meta: {
          links: {
            copy_private: '/api/files/copy_private',
            comments: '/files/comments',
            edit_tags: '/api/set_tags',
          },
          spec: {
            input_spec: [],
            output_spec: [],
          },
          path: [],
          count: 5,
          challenges: null,
          pagination: {
            current_page: 1,
            next_page: null,
            prev_page: null,
            total_pages: 1,
            total_count: 5,
          },
        },
      },
      { status: 200 },
    ),
  ),
  http.get('/api/spaces/:spaceId/files/subfolders*', () =>
    HttpResponse.json<FetchFolderChildrenResponse>(
      {
        nodes: spaceFolders,
      },
      { status: 200 },
    ),
  ),
  http.post('/api/v2/files/copy/validate', () =>
    HttpResponse.json(
      {
        ...existingFiles,
      },
      {
        status: 200,
      },
    ),
  ),
  http.post('/api/list_files_by_uid', () =>
    HttpResponse.json({
      files: mockExportInputFiles,
    }),
  ),

  http.post('/api/list_files', () => HttpResponse.json(mockCopyFiles)),
  http.post('/api/files/copy', () =>
    HttpResponse.json({
      meta: {
        messages: [{ type: 'success', message: 'Files copied successfully' }],
      },
    }),
  ),
]

export const mockCopyToSpaceFiles = [
  { id: '1', name: 'test-file-1.txt', uid: 'file-1' },
  { id: '2', name: 'test-file-2.txt', uid: 'file-2' },
  { id: '3', name: 'sample-data.csv', uid: 'file-3' },
]

export const mockCopyFiles = {
  files: [
    { id: 1, name: 'test-file-1.txt', uid: 'file-1' },
    { id: 2, name: 'test-file-2.txt', uid: 'file-2' },
    { id: 3, name: 'sample-data.csv', uid: 'file-3' },
  ],
  meta: {
    links: { copy: '/api/files/copy' },
    count: 3,
    pagination: { current_page: 1, next_page: null, prev_page: null, per_page: 25, total_pages: 1 },
  },
}
