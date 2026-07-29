import { HttpResponse, http } from 'msw'
import type { Asset } from '../../features/actionModals/AttachToModal/useListAssetsQuery'
import type { IAsset } from '../../features/assets/assets.types'

// Mock asset data for useSelectAssetModal (IAsset interface)
export const mockSelectAssets: IAsset[] = [
  {
    id: 1,
    uid: 'asset-test-123',
    dxid: 'asset-test-123',
    entity_type: 'asset',
    state: 'closed',
    file_size: '2.5 MB',
    file_license: {
      id: 'license-123',
      title: 'MIT License',
      uid: 'license-mit-123',
    },
    show_license_pending: false,
    name: 'test-dataset.csv',
    title: 'Test Dataset',
    description: 'A test dataset for analysis',
    added_by: 'user@example.com',
    added_by_fullname: 'Test User',
    archive_content: ['data.csv', 'metadata.json'],
    created_at: '2024-01-01T10:00:00Z',
    created_at_date_time: '2024-01-01T10:00:00Z',
    updated_at: new Date('2024-01-01T10:00:00Z'),
    location: 'Private',
    readme: 'Test dataset for demonstration',
    revision: 1,
    public: false,
    private: true,
    in_space: false,
    app_series_id: 1,
    run_by_you: '0',
    org: {
      handle: 'test-org',
      name: 'Test Organization',
    },
    path: '/assets/asset-test-123',
    origin: {
      text: 'Uploaded',
      fa: 'fa-upload',
      href: '/uploads/asset-test-123',
    },
    explorers: 2,
    featured: false,
    scope: 'private',
    user: {
      dxuser: 'test.user',
      full_name: 'Test User',
    },
    active: true,
    links: {},
    tags: ['dataset', 'test'],
    properties: {
      format: 'CSV',
      rows: '1000',
    },
  },
  {
    id: 2,
    uid: 'asset-public-456',
    dxid: 'asset-public-456',
    entity_type: 'asset',
    state: 'closed',
    file_size: '15.8 MB',
    file_license: {
      id: 'license-456',
      title: 'Apache 2.0',
      uid: 'license-apache-456',
    },
    show_license_pending: false,
    name: 'genomic-reference.fasta',
    title: 'Genomic Reference Data',
    description: 'Reference genome data for analysis',
    added_by: 'admin@example.com',
    added_by_fullname: 'Admin User',
    archive_content: ['reference.fasta', 'index.fai'],
    created_at: '2024-01-01T09:00:00Z',
    created_at_date_time: '2024-01-01T09:00:00Z',
    updated_at: new Date('2024-01-01T09:00:00Z'),
    location: 'Public',
    readme: 'Reference genome for genomic analysis',
    revision: 2,
    public: true,
    private: false,
    in_space: false,
    app_series_id: 2,
    run_by_you: '1',
    org: {
      handle: 'public-org',
      name: 'Public Organization',
    },
    path: '/assets/asset-public-456',
    origin: 'Contributed by community',
    explorers: 25,
    featured: true,
    scope: 'public',
    user: {
      dxuser: 'admin.user',
      full_name: 'Admin User',
    },
    active: true,
    links: {},
    tags: ['genomics', 'reference', 'public'],
    properties: {
      format: 'FASTA',
      organism: 'Human',
    },
  },
  {
    id: 3,
    uid: 'asset-space-789',
    dxid: 'asset-space-789',
    entity_type: 'asset',
    state: 'closed',
    file_size: '8.2 MB',
    file_license: {
      id: 'license-789',
      title: 'Custom License',
      uid: 'license-custom-789',
    },
    show_license_pending: true,
    name: 'training-model.pkl',
    title: 'ML Training Model',
    description: 'Pre-trained machine learning model',
    added_by: 'researcher@example.com',
    added_by_fullname: 'Research User',
    archive_content: ['model.pkl', 'config.json', 'requirements.txt'],
    created_at: '2024-01-01T11:00:00Z',
    created_at_date_time: '2024-01-01T11:00:00Z',
    updated_at: new Date('2024-01-01T11:00:00Z'),
    location: 'Space: ML Research',
    readme: 'Machine learning model for prediction tasks',
    revision: 1,
    public: false,
    private: false,
    in_space: true,
    app_series_id: 3,
    run_by_you: '0',
    org: {
      handle: 'research-org',
      name: 'Research Organization',
    },
    path: '/assets/asset-space-789',
    origin: {
      text: 'Generated',
      fa: 'fa-cogs',
      href: '/jobs/job-generator-123',
    },
    explorers: 8,
    featured: false,
    scope: 'space-123',
    user: {
      dxuser: 'researcher.user',
      full_name: 'Research User',
    },
    active: true,
    links: {},
    tags: ['ml', 'model', 'research'],
    properties: {
      format: 'Pickle',
      framework: 'scikit-learn',
    },
  },
]

// Mock asset data for useAssetAttachModal (Asset interface)
const createAttachAsset = ({
  id,
  title,
  name,
  description,
  content,
  scope = 'private',
  fa_class = 'fa-file',
}: {
  id: number
  title: string
  name: string
  description: string
  content: string
  scope?: string
  fa_class?: string
}): Asset => {
  const isPublic = scope === 'public'
  return {
    id,
    uid: `asset-${id}`,
    className: 'Asset',
    fa_class,
    scope,
    path: `/assets/${name}`,
    owned: !isPublic,
    editable: !isPublic,
    accessible: true,
    file_path: `/assets/${name}.md`,
    parent_folder_name: 'assets',
    public: isPublic,
    private: !isPublic,
    in_space: isPublic,
    space_private: false,
    space_public: isPublic,
    title,
    name,
    prefix: 'asset',
    description,
    file_paths: [`/assets/${name}.md`],
    content,
  }
}

export const mockAttachAssets: Asset[] = [
  createAttachAsset({
    id: 1,
    title: 'Documentation Guide',
    name: 'documentation-guide',
    description: 'A comprehensive guide for project documentation',
    content:
      '# Documentation Guide\n\nThis is a comprehensive guide for creating and maintaining project documentation.\n\n## Getting Started\n\n1. Create clear headings\n2. Use bullet points for lists\n3. Include code examples\n\n```javascript\nconst example = "Hello World";\nconsole.log(example);\n```\n\n## Best Practices\n\n- Keep it simple and clear\n- Update regularly\n- Include examples',
  }),
  createAttachAsset({
    id: 2,
    title: 'API Reference',
    name: 'api-reference',
    fa_class: 'fa-database',
    description: 'Complete API documentation and reference',
    content:
      '# API Reference\n\n## Authentication\n\nAll API requests require authentication using an API key.\n\n```bash\ncurl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/endpoint\n```\n\n## Endpoints\n\n### GET /api/users\n\nRetrieve a list of users.\n\n**Response:**\n```json\n{\n  "users": [\n    {\n      "id": 1,\n      "name": "John Doe",\n      "email": "john@example.com"\n    }\n  ]\n}\n```',
  }),
  createAttachAsset({
    id: 3,
    title: 'Configuration Template',
    name: 'configuration-template',
    fa_class: 'fa-cog',
    scope: 'public',
    description: 'Template for application configuration files',
    content:
      '# Configuration Template\n\nUse this template to configure your application.\n\n## Environment Variables\n\n```env\nDATABASE_URL=postgresql://localhost:5432/mydb\nAPP_SECRET=your-secret-key\nPORT=3000\n```\n\n## Configuration File\n\n```yaml\nserver:\n  port: 3000\n  host: localhost\n\ndatabase:\n  url: postgresql://localhost:5432/mydb\n  pool_size: 10\n\nlogging:\n  level: info\n  format: json\n```',
  }),
  createAttachAsset({
    id: 4,
    title: 'Tutorial: Getting Started',
    name: 'tutorial-basics',
    fa_class: 'fa-book',
    description: 'Basic tutorial for new users',
    content:
      '# Getting Started Tutorial\n\nWelcome to our platform! This tutorial will guide you through the basics.\n\n## Step 1: Setup\n\nFirst, make sure you have all the prerequisites installed:\n\n- Node.js (v16 or higher)\n- npm or yarn\n- Git\n\n## Step 2: Installation\n\n```bash\nnpm install\nnpm start\n```\n\n## Step 3: Your First Project\n\nCreate your first project by following these steps...',
  }),
  createAttachAsset({
    id: 5,
    title: 'Python Runtime Bundle',
    name: 'python-runtime',
    fa_class: 'fa-code',
    description: 'Preconfigured Python runtime for analysis apps',
    content:
      '# Python Runtime Bundle\n\nIncludes Python 3.11, pip, and common scientific packages.\n\n## Packages\n\n- numpy\n- pandas\n- scipy\n- matplotlib',
  }),
  createAttachAsset({
    id: 6,
    title: 'R Analysis Toolkit',
    name: 'r-toolkit',
    fa_class: 'fa-bar-chart',
    description: 'R packages commonly used in genomic analysis',
    content:
      '# R Analysis Toolkit\n\nA curated set of R libraries for biostatistics workflows.\n\n## Included\n\n- ggplot2\n- dplyr\n- Bioconductor core packages',
  }),
  createAttachAsset({
    id: 7,
    title: 'Docker Base Image Notes',
    name: 'docker-base-notes',
    fa_class: 'fa-cube',
    scope: 'public',
    description: 'Notes describing the shared Docker base image',
    content:
      '# Docker Base Image Notes\n\nUse this asset when attaching a documented container environment to a VM.\n\n## Image\n\n`dnanexus/analysis-base:1.4`',
  }),
  createAttachAsset({
    id: 8,
    title: 'Genome Reference Index',
    name: 'genome-reference-index',
    fa_class: 'fa-sitemap',
    description: 'Indexed reference genome files for alignment jobs',
    content:
      '# Genome Reference Index\n\nContains FASTA and BWA indexes for GRCh38.\n\n## Contents\n\n- `GRCh38.fa`\n- `GRCh38.fa.bwt`\n- `GRCh38.fa.ann`',
  }),
  createAttachAsset({
    id: 9,
    title: 'Sample QC Scripts',
    name: 'sample-qc-scripts',
    fa_class: 'fa-check-square',
    description: 'Shell and Python scripts for sample quality control',
    content:
      '# Sample QC Scripts\n\nRun these scripts after ingesting FASTQ files.\n\n```bash\n./bin/run_fastqc.sh /input /output\n```',
  }),
  createAttachAsset({
    id: 10,
    title: 'VM Bootstrap Checklist',
    name: 'vm-bootstrap-checklist',
    fa_class: 'fa-list',
    description: 'Checklist for preparing a VM environment with assets',
    content:
      '# VM Bootstrap Checklist\n\n1. Attach runtime assets\n2. Verify mount paths\n3. Confirm license acceptance\n4. Launch the analysis app',
  }),
]

// Mock data for delete operations
export const mockDeleteAssets = [
  { id: '3', name: 'dataset.csv', location: '/data/dataset.csv' },
  { id: '4', name: 'model.pkl', location: '/models/model.pkl' },
]

// Mock handlers for assets API
export const assetsHandlers = [
  http.get('/api/assets', () =>
    HttpResponse.json(
      {
        assets: [
          {
            id: 96541,
            name: 'shoudFail.tar.gz',
            type: 'Asset',
            state: 'closed',
            location: 'Private',
            added_by: 'Minch Yoda',
            created_at: '06/06/2022',
            featured: false,
            scope: 'private',
            space_id: null,
            locked: false,
            origin: {
              href: '/home/assets/file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1',
              fa: 'fa fa-file-zip-o fa-fw',
              text: '  shoudFail',
            },
            tags: ['tags', 'are', 'cool'],
            uid: 'file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1',
            file_size: '190 Bytes',
            created_at_date_time: '2022-06-06 12:05:27 CEST',
            description: 'you should have read me\n',
            links: {
              origin_object: { origin_type: 'Asset', origin_uid: 'file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1' },
              show: '/api/assets/file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1',
              user: '/users/minch.yoda',
              track: '/track?id=file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1',
              download_list: '/api/files/download_list',
              add_folder: '/api/files/create_folder',
              update: '/api/assets/file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1',
              download: '/api/files/file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1/download',
              copy: '/api/files/copy',
              publish: '/publish?id=file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1',
              remove: '/api/assets/file-GBKx2kj0JqyZgZGbK9bVZ7jJ-1',
              license: '/api/licenses/:id/license_item/:item_uid',
              organize: '/api/files/move',
              feature: '/api/assets/feature',
              rename: '/api/assets/rename',
            },
            file_license: {},
            show_license_pending: false,
            archive_content: ['work/file.sh'],
          },
          {
            id: 96561,
            name: 'testing-asset.tar.gz',
            type: 'Asset',
            state: 'closed',
            location: 'Private',
            added_by: 'Minch Yoda',
            created_at: '06/07/2022',
            featured: false,
            scope: 'private',
            space_id: null,
            locked: false,
            origin: {
              href: '/home/assets/file-GBPj0980JqyVVyk9699jY41p-1',
              fa: 'fa fa-file-zip-o fa-fw',
              text: '  testing-asset',
            },
            tags: [],
            uid: 'file-GBPj0980JqyVVyk9699jY41p-1',
            file_size: '10 KB',
            created_at_date_time: '2022-06-07 18:43:17 CEST',
            description:
              '# Testing asset content\nThis content was created for testing purposes.\n\nThanks for reaching out!\n',
            links: {
              origin_object: { origin_type: 'Asset', origin_uid: 'file-GBPj0980JqyVVyk9699jY41p-1' },
              show: '/api/assets/file-GBPj0980JqyVVyk9699jY41p-1',
              user: '/users/minch.yoda',
              track: '/track?id=file-GBPj0980JqyVVyk9699jY41p-1',
              download_list: '/api/files/download_list',
              add_folder: '/api/files/create_folder',
              update: '/api/assets/file-GBPj0980JqyVVyk9699jY41p-1',
              download: '/api/files/file-GBPj0980JqyVVyk9699jY41p-1/download',
              copy: '/api/files/copy',
              publish: '/publish?id=file-GBPj0980JqyVVyk9699jY41p-1',
              remove: '/api/assets/file-GBPj0980JqyVVyk9699jY41p-1',
              license: '/api/licenses/:id/license_item/:item_uid',
              organize: '/api/files/move',
              feature: '/api/assets/feature',
              rename: '/api/assets/rename',
            },
            file_license: {},
            show_license_pending: false,
            archive_content: ['asset-content-file.txt'],
          },
        ],
        meta: {
          links: { copy_private: '/api/files/copy' },
          count: 3,
          pagination: { current_page: 1, next_page: 2, prev_page: null, total_pages: 2, total_count: 21 },
        },
      },
      { status: 200 },
    ),
  ),

  // Handler for /api/list_assets (used by useSelectAssetModal and useAssetAttachModal)
  http.post('/api/list_assets', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

    // If request has scopes/search_string/states, return IAsset[] format (useSelectAssetModal)
    if (body && ('scopes' in body || 'search_string' in body || 'states' in body)) {
      return HttpResponse.json(mockSelectAssets)
    }

    // Otherwise return Asset[] format (useAssetAttachModal)
    return HttpResponse.json(mockAttachAssets)
  }),

  // Handler for /api/assets/delete (used by useDeleteModal)
  http.post('/api/assets/delete', () =>
    HttpResponse.json({
      meta: {
        messages: [{ type: 'success', message: 'Assets deleted successfully' }],
      },
    }),
  ),
]
