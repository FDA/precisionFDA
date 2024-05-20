import { indexBy } from 'ramda'
import { http, HttpResponse } from 'msw'
import { ComputeInstance, IApp } from './apps.types'

const meta = { 'spec': { 'input_spec': [], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'revisions': [{ 'title': 'a', 'id': 5381, 'uid': 'app-GP8VYXj0fyJykyzv7FQ9k3Bv-1', 'revision': 4, 'version': null, 'tag_list': [] }, { 'title': 'a', 'id': 5320, 'uid': 'app-GJk4Fx80g4pjYzFj57yZzZfQ-1', 'revision': 3, 'version': null, 'tag_list': [] }, { 'title': 'a', 'id': 5306, 'uid': 'app-GJPvq600b42X5gJ5JqgY3KY3-1', 'revision': 2, 'version': null, 'tag_list': [] }, { 'title': 'a', 'id': 5262, 'uid': 'app-GGG9vy00Gqx2FZ1kK17jx3Z7-1', 'revision': 1, 'version': null, 'tag_list': [] }], 'jobs': [], 'assigned_challenges': [], 'challenges': [], 'notes': [], 'discussions': [], 'answers': [], 'comparator': false, 'default_comparator': false, 'comments': [], 'links': { 'comments': '/apps/app-GP8VYXj0fyJykyzv7FQ9k3Bv-1/comments', 'edit_tags': '/api/set_tags', 'comparators': {} } }
const pageMeta = { 'links': { 'copy_private': '/api/apps/copy', 'create': '/apps/new' }, 'count': 2, 'notes': [{ 'id': 964, 'title': "Dr. Leon Voss's untitled note", 'content': 't nisi eu ipsum elementum dignissim. Suspendisse potenti', 'added_by': 'lvoss', 'added_by_fullname': 'Dr. Leon Voss', 'created_at': '02/07/2022', 'created_at_date_time': '2022-02-07 14:01:52 +03', 'location': 'Private', 'note_type': null, 'links': { 'show': '/notes/964-randall-ebert-s-untitled-note', 'user': '/users/lvoss' }, 'tags': [] }], 'answers': [], 'discussions': [{ 'id': 96, 'user_id': 490, 'created_at': '2022-12-01T18:44:00.000+03:00', 'updated_at': '2022-12-01T18:44:00.000+03:00', 'note_id': 966, 'tag_list': [] }, { 'id': 95, 'user_id': 490, 'created_at': '2022-11-23T17:28:18.000+03:00', 'updated_at': '2022-11-23T17:28:18.000+03:00', 'note_id': 965, 'tag_list': [] }], 'pagination': { 'current_page': 1, 'next_page': null, 'prev_page': null, 'total_pages': 1, 'total_count': 2 } }

const base = {
  'id': 1, 'uid': 'base', 'dxid': 'base', 'entity_type': 'regular', 'name': 'base', 'title': 'base', 'added_by': 'lvoss', 'added_by_fullname': 'Dr. Leon Voss', 'created_at': '07/13/2022', 'created_at_date_time': '2022-07-13 16:29:11 +03', 'updated_at': '2022-07-13T16:29:11.000+03:00', 'location': 'Private', 'readme': '', 'scope': 'private', 'revision': 1, 'app_series_id': 2096, 'run_by_you': 'Try', 'org': 'lvoss', 'explorers': 0, 'featured': false, 'active': true, 'links': { 'show': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1', 'user': '/users/lvoss', 'jobs': '/api/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/jobs', 'track': '/track?id=app-GF7GV9Q0822pG8q53X6z2Bz3-1', 'fork': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/fork', 'export': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/export', 'cwl_export': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/cwl_export', 'wdl_export': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/wdl_export', 'copy': '/api/apps/copy', 'attach_to': '/api/attach_to_notes', 'delete': '/api/apps/delete', 'edit': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/edit', 'edit_tags': '/api/set_tags', 'assign_app': '/api/assign_app', 'publish': '/publish?id=app-GF7GV9Q0822pG8q53X6z2Bz3-1', 'run_job': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/jobs/new', 'batch_run': '/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1/batch_app', 'feature': '/api/apps/feature' }, 'tags': [], 'job_count': 0, 'latest_revision': true,
} satisfies IApp

export const apps = [
  { ...base, 'id': 4335, 'uid': 'app-GF7GV9Q0822pG8q53X6z2Bz3-1', 'dxid': 'app-GF7GV9Q0822pG8q53X6z2Bz3', 'entity_type': 'regular', 'name': 'blast', 'title': 'BLAST (Basic Local Alignment Search Tool)' },
  { ...base, 'id': 4336, 'uid': 'app-G5GGfk80bvkqFYZj0YG03pia-1', 'dxid': 'app-G5GGfk80bvkqFYZj0YG03pia', 'entity_type': 'regular', 'name': 'bowtie_tophat', 'title': 'Bowtie/Tophat' },
  { ...base, 'id': 4337, 'uid': 'app-H2GGfk50bvkqFYZj0YG02pow-1', 'dxid': 'app-H2GGfk50bvkqFYZj0YG02pow', 'entity_type': 'regular', 'name': 'filter_quality', 'title': 'Filter Quality' },
  { ...base, 'id': 4338, 'uid': 'app-N9GGfk20bvkqFYZj0YG07pfe-1', 'dxid': 'app-N9GGfk20bvkqFYZj0YG07pfe', 'entity_type': 'regular', 'name': 'sequence_alignment', 'title': 'Sequence Alignment' },
  { ...base, 'id': 4339, 'uid': 'app-L6GGfk10bvkqFYZj0YG02pbu-1', 'dxid': 'app-L6GGfk10bvkqFYZj0YG02pbu', 'entity_type': 'regular', 'name': 'scoring_matrix_calculation', 'title': 'Scoring Matrix Calculation' },
] satisfies IApp[]

export const appsByUid = indexBy(s => s.uid, apps)

export const appsMocks = [
  http.post('/api/list_apps', () => HttpResponse.json([
    { 'id': 1341, 'uid': 'app-G8GGfk00bvkqFYZj0YG02pbq-1', 'className': 'app', 'fa_class': 'fa-cube', 'scope': 'space-1', 'path': '/home/apps/app-G8GGfk00bvkqFYZj0YG02pbq-1', 'owned': true, 'editable': true, 'accessible': true, 'file_path': null, 'parent_folder_name': null, 'public': false, 'private': true, 'in_space': false, 'space_private': false, 'space_public': false, 'title': 'afsdfsf', 'name': 'asdfasd', 'version': null, 'revision': 1, 'readme': '', 'spec': { 'input_spec': [], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'dxid': 'app-G8GGfk00bvkqFYZj0YG02pba' },
    { 'id': 1347, 'uid': 'app-GF7GV9Q0822pG8q53X6z2Bz3-1', 'className': 'app', 'fa_class': 'fa-cube', 'scope': 'space-2', 'path': '/home/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1', 'owned': true, 'editable': true, 'accessible': true, 'file_path': null, 'parent_folder_name': null, 'public': false, 'private': true, 'in_space': false, 'space_private': false, 'space_public': false, 'title': 'another test for testing', 'name': 'this-is-a-test', 'version': null, 'revision': 1, 'readme': '', 'spec': { 'input_spec': [{ 'name': 'fdssfs', 'class': 'string', 'optional': true, 'label': '', 'help': '' }], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'dxid': 'app-GF7GV9Q0822pG8q53X6z2Bz3' },
    { 'id': 1337, 'uid': 'app-G817g980x0vb48pV4Vff4V1z-1', 'className': 'app', 'fa_class': 'fa-cube', 'scope': 'space-3', 'path': '/home/apps/app-G817g980x0vb48pV4Vff4V1X-1', 'owned': true, 'editable': true, 'accessible': true, 'file_path': null, 'parent_folder_name': null, 'public': false, 'private': true, 'in_space': false, 'space_private': false, 'space_public': false, 'title': 'asdf', 'name': 'adf', 'version': null, 'revision': 2, 'readme': '', 'spec': { 'input_spec': [], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'dxid': 'app-G817g980x0vb48pV4Vff4V1X' },
    { 'id': 1370, 'uid': 'app-GQpb4F806vyv2BvXYYpz8pK5-1', 'className': 'app', 'fa_class': 'fa-cube', 'scope': 'private', 'path': '/home/apps/app-GQpb4F806vyv2BvXYYpz8pK5-1', 'owned': true, 'editable': true, 'accessible': true, 'file_path': null, 'parent_folder_name': null, 'public': false, 'private': true, 'in_space': false, 'space_private': false, 'space_public': false, 'title': 'just for tests', 'name': 'testing-the-app', 'version': null, 'revision': 3, 'readme': '# Something About this are bibendum.\n```', 'spec': { 'input_spec': [{ 'name': 'Thissfsdf', 'class': 'string', 'optional': true, 'label': 'sdfdf', 'help': 'df' }], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'dxid': 'app-GQpb4F806vyv2BvXYYpz8pK5' },
    { 'id': 1342, 'uid': 'app-G8GGfk00bvkqFYZj0YG02rbg-1', 'className': 'app', 'fa_class': 'fa-cube', 'scope': 'private', 'path': '/home/apps/app-G8GGfk00bvkqFYZj0YG02pbq-1', 'owned': true, 'editable': true, 'accessible': true, 'file_path': null, 'parent_folder_name': null, 'public': false, 'private': true, 'in_space': false, 'space_private': false, 'space_public': false, 'title': 'afsdfsf', 'name': 'asdfasd', 'version': null, 'revision': 1, 'readme': '', 'spec': { 'input_spec': [], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'dxid': 'app-G8GGfk00bvkqFYZj0YG02pbq' },
    { 'id': 1348, 'uid': 'app-GF7GV9Q0822pG8q53X6z2Bz2-1', 'className': 'app', 'fa_class': 'fa-cube', 'scope': 'private', 'path': '/home/apps/app-GF7GV9Q0822pG8q53X6z2Bz3-1', 'owned': true, 'editable': true, 'accessible': true, 'file_path': null, 'parent_folder_name': null, 'public': false, 'private': true, 'in_space': false, 'space_private': false, 'space_public': false, 'title': 'another test for testing', 'name': 'this-is-a-test', 'version': null, 'revision': 1, 'readme': '', 'spec': { 'input_spec': [{ 'name': 'fdssfs', 'class': 'string', 'optional': true, 'label': '', 'help': '' }], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'dxid': 'app-GF7GV9Q0822pG8q53X6z2Bz2' },
    { 'id': 1338, 'uid': 'app-G817g980x0vb48pV4Vff4V1X-1', 'className': 'app', 'fa_class': 'fa-cube', 'scope': 'private', 'path': '/home/apps/app-G817g980x0vb48pV4Vff4V1X-1', 'owned': true, 'editable': true, 'accessible': true, 'file_path': null, 'parent_folder_name': null, 'public': false, 'private': true, 'in_space': false, 'space_private': false, 'space_public': false, 'title': 'asdf', 'name': 'adf', 'version': null, 'revision': 2, 'readme': '', 'spec': { 'input_spec': [], 'output_spec': [], 'internet_access': false, 'instance_type': 'baseline-8' }, 'dxid': 'app-G817g980x0vb48pV4Vff4V12' },
  ], { status: 200 })),
  http.get('/api/apps/user_compute_resources', () => HttpResponse.json<ComputeInstance[]>([
    {
      'value': 'baseline-2',
      'label': 'Baseline 2    0.286$/hour',
    },
    {
      'value': 'baseline-4',
      'label': 'Baseline 4    0.572$/hour',
    },
    {
      'value': 'baseline-8',
      'label': 'Baseline 8    1.144$/hour',
    },
    {
      'value': 'baseline-16',
      'label': 'Baseline 16    2.288$/hour',
    },
    {
      'value': 'baseline-36',
      'label': 'Baseline 36    5.148$/hour',
    },
    {
      'value': 'himem-2',
      'label': 'High Mem 2    0.474$/hour',
    },
    {
      'value': 'himem-4',
      'label': 'High Mem 4    0.948$/hour',
    },
    {
      'value': 'himem-8',
      'label': 'High Mem 8    1.896$/hour',
    },
    {
      'value': 'himem-16',
      'label': 'High Mem 16    3.792$/hour',
    },
    {
      'value': 'himem-32',
      'label': 'High Mem 32    7.584$/hour',
    },
    {
      'value': 'hidisk-2',
      'label': 'High Disk 2    0.372$/hour',
    },
    {
      'value': 'hidisk-4',
      'label': 'High Disk 4    0.744$/hour',
    },
    {
      'value': 'hidisk-8',
      'label': 'High Disk 8    1.488$/hour',
    },
    {
      'value': 'hidisk-16',
      'label': 'High Disk 16    2.976$/hour',
    },
    {
      'value': 'hidisk-36',
      'label': 'High Disk 36    6.696$/hour',
    },
    {
      'value': 'gpu-8',
      'label': 'GPU 8    7.584$/hour',
    },
  ], { status: 200 })),
  http.get('/api/apps/:uid', ({ params }) => HttpResponse.json({ 'app': appsByUid[params.uid], meta }, { status: 200 })),
  http.get('/api/apps*', () => HttpResponse.json({ 'apps': apps, meta: pageMeta }, { status: 200 })),
]
