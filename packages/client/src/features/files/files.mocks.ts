import { http, HttpResponse } from 'msw'
import { indexBy } from 'ramda'
import { FetchFilesQuery, FetchFolderChildrenResponse } from './files.api'
import { IFile, IFolder } from './files.types'

const meta = {
  user_licenses: [
    {
      id: 122,
      uid: 'license-122',
      title: 'Minch Yoda License (2022-10-03 11:36:55)',
      created_at_date_time: '2022-10-03 13:36:55 CEST',
    },
    {
      id: 124,
      uid: 'license-124',
      title: 'Minch Yoda License (2022-11-04 10:30:42)',
      created_at_date_time: '2022-11-04 11:30:42 CET',
    },
    {
      id: 125,
      uid: 'license-125',
      title: 'Minch Yoda License requiring approval',
      created_at_date_time: '2022-12-20 15:56:34 CET',
    },
    {
      id: 126,
      uid: 'license-126',
      title: 'Minch Yoda License not requiring approval',
      created_at_date_time: '2022-12-20 15:57:24 CET',
    },
  ],
  object_license: {},
  comments: [],
  discussions: [],
  answers: [],
  notes: [],
  comparisons: [],
  links: {
    comments: '/files/file-Gf023q80JqyZ083yPYZ54qpJ-1/comments',
    edit_tags: '/api/set_tags',
  },
}

const folders = [
  {
    id: 11,
    name: 'Most Important',
    type: 'Folder',
    state: null,
    location: 'Private',
    added_by: 'Randall Ebert',
    created_at: '01/23/2024',
    featured: false,
    scope: 'private',
    space_id: null,
    locked: false,
    tags: [],
    properties: {},
    path: [
      {
        id: 14,
        name: 'Most Important',
      },
      {
        id: null,
        name: '/',
      },
    ],
    created_at_date_time: '2024-01-23 13:51:19 CET',
    links: {
      origin_object: {
        origin_type: 'User',
        origin_uid: 'user-7',
      },
      rename_folder: '/api/folders/rename_folder',
      organize: '/api/files/move',
      remove: '/api/files/remove',
      user: '/users/randall.ebert',
      copy: '/api/files/copy',
      children: '/api/folders/children',
      publish: '/api/folders/publish_folders',
      feature: '/api/files/feature',
    },
  },
] satisfies IFolder[]

const spaceFolders = [
  {
    id: 212,
    name: 'copied',
    type: 'Folder',
    state: null,
    location: 'group - Shared',
    added_by: 'Sirius Black',
    created_at: '06/03/2024',
    featured: false,
    scope: 'space-32',
    space_id: 'space-32',
    locked: false,
    origin: null,
    tags: [],
    properties: {},
    path: [
      {
        id: 212,
        name: 'copied',
      },
      {
        id: null,
        name: '/',
      },
    ],
    created_at_date_time: '2024-06-03 08:21:25 UTC',
    links: {
      origin_object: {
        origin_type: 'Folder',
        origin_uid: null,
      },
      rename_folder: '/api/folders/rename_folder',
      organize: '/api/files/move',
      remove: '/api/files/remove',
      user: '/users/sirius.black',
      space: '/spaces/32',
      copy: '/api/files/copy',
      children: '/api/folders/children',
    },
  },
  {
    id: 220,
    name: 'test_sync_folder',
    type: 'Folder',
    state: null,
    location: 'group - Shared',
    added_by: 'John pfda_autotest1',
    created_at: '06/05/2024',
    featured: false,
    scope: 'space-32',
    space_id: 'space-32',
    locked: false,
    origin: null,
    tags: [],
    properties: {},
    path: [
      {
        id: 220,
        name: 'test_sync_folder',
      },
      {
        id: null,
        name: '/',
      },
    ],
    created_at_date_time: '2024-06-05 09:35:12 UTC',
    links: {
      origin_object: {
        origin_type: 'Folder',
        origin_uid: null,
      },
      rename_folder: '/api/folders/rename_folder',
      organize: '/api/files/move',
      remove: '/api/files/remove',
      user: '/users/pfda_autotest1',
      space: '/spaces/32',
      copy: '/api/files/copy',
      children: '/api/folders/children',
    },
  },
] satisfies IFolder[]

const files = [
  {
    id: 9,
    name: 'CI_Patient1_ExomeSeq_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    added_by: 'Dr. Leon Voss',
    created_at: '11/30/2023',
    featured: false,
    scope: 'private',
    space_id: null,
    locked: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-ArZB34Q0ZkG51XVbFKkjKj52-1',
    file_size: '310 KB',
    created_at_date_time: '2023-11-30 15:52:02 CET',
    description: null,
    links: {
      origin_object: {
        origin_type: 'User',
        origin_uid: 'user-7',
      },
      show: '/files/file-GbZB34Q0ZkG51XVbFKkjKj52-1',
      user: '/users/lvoss',
      track: '/track?id=file-GbZB34Q0ZkG51XVbFKkjKj52-1',
      download_list: '/api/files/download_list',
      attach_to: '/api/attach_to_notes',
      add_file: '/api/create_file',
      add_folder: '/api/files/create_folder',
      update: '/api/files',
      download: '/api/files/file-GbZB34Q0ZkG51XVbFKkjKj52-1/download',
      copy: '/api/files/copy',
      publish: '/publish?id=file-GbZB34Q0ZkG51XVbFKkjKj52-1',
      remove: '/api/files/remove',
      license: '/api/licenses/:id/license_item/:item_uid',
      organize: '/api/files/move',
      feature: '/api/files/feature',
    },
    file_license: {},
    show_license_pending: false,
  },
  {
    id: 8,
    name: 'CI_Patient2_RNASeq_Batch3_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    added_by: 'Dr. Leon Voss',
    created_at: '11/30/2023',
    featured: false,
    scope: 'private',
    space_id: null,
    locked: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-ObZB33j0ZkG7FjJq36FBz4z7-1',
    file_size: '197 KB',
    created_at_date_time: '2023-11-30 15:51:59 CET',
    description: null,
    links: {
      origin_object: {
        origin_type: 'User',
        origin_uid: 'user-7',
      },
      show: '/files/file-GbZB33j0ZkG7FjJq36FBz4z7-1',
      user: '/users/lvoss',
      track: '/track?id=file-GbZB33j0ZkG7FjJq36FBz4z7-1',
      download_list: '/api/files/download_list',
      attach_to: '/api/attach_to_notes',
      add_file: '/api/create_file',
      add_folder: '/api/files/create_folder',
      update: '/api/files',
      download: '/api/files/file-GbZB33j0ZkG7FjJq36FBz4z7-1/download',
      copy: '/api/files/copy',
      publish: '/publish?id=file-GbZB33j0ZkG7FjJq36FBz4z7-1',
      remove: '/api/files/remove',
      license: '/api/licenses/:id/license_item/:item_uid',
      organize: '/api/files/move',
      feature: '/api/files/feature',
    },
    file_license: {},
    show_license_pending: false,
  },
  {
    id: 7,
    name: 'CI_Patient3_GenomeSeq_Run5_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    added_by: 'Dr. Leon Voss',
    created_at: '11/30/2023',
    featured: false,
    scope: 'private',
    space_id: null,
    locked: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-GbZB3300ZkG3gzZG1xK1Pp10-1',
    file_size: '240 KB',
    created_at_date_time: '2023-11-30 15:51:56 CET',
    description: null,
    links: {
      origin_object: {
        origin_type: 'User',
        origin_uid: 'user-7',
      },
      show: '/files/file-GbZB3300ZkG3gzZG1xK1Pp10-1',
      user: '/users/lvoss',
      track: '/track?id=file-GbZB3300ZkG3gzZG1xK1Pp10-1',
      download_list: '/api/files/download_list',
      attach_to: '/api/attach_to_notes',
      add_file: '/api/create_file',
      add_folder: '/api/files/create_folder',
      update: '/api/files',
      download: '/api/files/file-GbZB3300ZkG3gzZG1xK1Pp10-1/download',
      copy: '/api/files/copy',
      publish: '/publish?id=file-GbZB3300ZkG3gzZG1xK1Pp10-1',
      remove: '/api/files/remove',
      license: '/api/licenses/:id/license_item/:item_uid',
      organize: '/api/files/move',
      feature: '/api/files/feature',
    },
    file_license: {},
    show_license_pending: false,
  },
  {
    id: 6,
    name: 'CI_Patient4_Metagenomics_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    added_by: 'Dr. Leon Voss',
    created_at: '11/30/2023',
    featured: false,
    scope: 'private',
    space_id: null,
    locked: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-GbZB32Q0ZkGB7y6zvVk68pJJ-1',
    file_size: '82.9 KB',
    created_at_date_time: '2023-11-30 15:51:54 CET',
    description: null,
    links: {
      origin_object: {
        origin_type: 'User',
        origin_uid: 'user-7',
      },
      show: '/files/file-GbZB32Q0ZkGB7y6zvVk68pJJ-1',
      user: '/users/lvoss',
      track: '/track?id=file-GbZB32Q0ZkGB7y6zvVk68pJJ-1',
      download_list: '/api/files/download_list',
      attach_to: '/api/attach_to_notes',
      add_file: '/api/create_file',
      add_folder: '/api/files/create_folder',
      update: '/api/files',
      download: '/api/files/file-GbZB32Q0ZkGB7y6zvVk68pJJ-1/download',
      copy: '/api/files/copy',
      publish: '/publish?id=file-GbZB32Q0ZkGB7y6zvVk68pJJ-1',
      remove: '/api/files/remove',
      license: '/api/licenses/:id/license_item/:item_uid',
      organize: '/api/files/move',
      feature: '/api/files/feature',
    },
    file_license: {},
    show_license_pending: false,
  },
  {
    id: 3,
    name: 'CI_Patient5_TranscriptomeSeq_2024-01-18.fastq.gz',
    type: 'UserFile',
    state: 'closed',
    location: 'Private',
    added_by: 'Dr. Leon Voss',
    created_at: '11/28/2023',
    featured: false,
    scope: 'private',
    space_id: null,
    locked: false,
    origin: 'Uploaded',
    tags: [],
    properties: {},
    uid: 'file-GbXq8J80ZkG7Yq5KQ3fXYzGk-1',
    file_size: '240 KB',
    created_at_date_time: '2023-11-28 10:34:45 CET',
    description: null,
    links: {
      origin_object: {
        origin_type: 'User',
        origin_uid: 'user-7',
      },
      show: '/files/file-GbXq8J80ZkG7Yq5KQ3fXYzGk-1',
      user: '/users/lvoss',
      track: '/track?id=file-GbXq8J80ZkG7Yq5KQ3fXYzGk-1',
      download_list: '/api/files/download_list',
      attach_to: '/api/attach_to_notes',
      add_file: '/api/create_file',
      add_folder: '/api/files/create_folder',
      update: '/api/files',
      download: '/api/files/file-GbXq8J80ZkG7Yq5KQ3fXYzGk-1/download',
      copy: '/api/files/copy',
      publish: '/publish?id=file-GbXq8J80ZkG7Yq5KQ3fXYzGk-1',
      remove: '/api/files/remove',
      license: '/api/licenses/:id/license_item/:item_uid',
      organize: '/api/files/move',
      feature: '/api/files/feature',
    },
    file_license: {},
    show_license_pending: false,
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
  http.get('/api/files/selected', () =>
    HttpResponse.json([...copyingNodes], {
      status: 200,
    }),
  ),
  http.get('/api/files/:uid', ({ params: { uid } }) =>
    HttpResponse.json<FetchFileQuery>({ files: filesByUid[uid], meta }, { status: 200 }),
  ),
  http.get('/api/files*', () =>
    HttpResponse.json<FetchFilesQuery>(
      {
        files: [...folders, ...files],
        meta: {
          count: 5,
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
  http.get(`/api/spaces/:spaceId/files/subfolders*`, () =>
    HttpResponse.json<FetchFolderChildrenResponse>(
      {
        nodes: spaceFolders,
      },
      { status: 200 },
    ),
  ),
  http.post('/api/files/copy/validate', () =>
    HttpResponse.json(
      {
        ...existingFiles,
      },
      {
        status: 200,
      },
    ),
  ),
]
