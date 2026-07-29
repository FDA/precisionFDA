import type { Meta, StoryObj } from '@storybook/react-vite'
import { HttpResponse, http } from 'msw'
import { useEffect } from 'react'
import { mockSelectAssets } from '../../../mocks/handlers/assets.handlers'
import { StorybookProviders } from '../../../stories/StorybookProviders'
import type { DialogType, ServerScope } from '../../home/types'
import type { IAsset } from '../assets.types'
import { useSelectAssetModal } from './useSelectAssetModal'

const makeExampleAsset = (
  baseAsset: IAsset,
  index: number,
  overrides: Partial<IAsset> & Pick<IAsset, 'title' | 'name' | 'scope' | 'location'>,
): IAsset => ({
  ...baseAsset,
  ...overrides,
  id: 5100 + index,
  uid: `asset-seq-${index}`,
  dxid: `asset-seq-${index}`,
  path: `/assets/asset-seq-${index}`,
  public: overrides.scope === 'public',
  private: overrides.scope === 'private',
  in_space: overrides.scope.startsWith('space-'),
  description: overrides.description ?? baseAsset.description,
  tags: overrides.tags ?? baseAsset.tags,
  properties: overrides.properties ?? baseAsset.properties,
  user: overrides.user ?? baseAsset.user,
  org: overrides.org ?? baseAsset.org,
})

const exampleSelectAssets: IAsset[] = [
  makeExampleAsset(mockSelectAssets[0], 1, {
    title: 'GRCh38 reference bundle for WGS alignment',
    name: 'grch38-reference-bundle.tar.gz',
    scope: 'private',
    location: 'Private',
    description: 'Reference FASTA, BWA indexes, and known sites for whole genome sequencing analysis.',
    tags: ['wgs', 'reference', 'grch38'],
    properties: { format: 'FASTA', assembly: 'GRCh38' },
  }),
  makeExampleAsset(mockSelectAssets[1], 2, {
    title: 'GIAB NA12878 truth set VCF and BED',
    name: 'giab-na12878-truth-set.zip',
    scope: 'public',
    location: 'Public',
    description: 'Benchmark variants and high-confidence regions for germline variant calling validation.',
    tags: ['benchmark', 'vcf', 'giab'],
    properties: { format: 'VCF/BED', sample: 'NA12878' },
  }),
  makeExampleAsset(mockSelectAssets[2], 3, {
    title: 'Tumor-normal panel BED targets',
    name: 'tumor-normal-panel-targets.bed',
    scope: 'space-123',
    location: 'Space: Oncology Sequencing',
    description: 'Capture target intervals for the oncology 500 gene sequencing panel.',
    tags: ['oncology', 'panel', 'bed'],
    properties: { format: 'BED', genes: '500' },
  }),
  makeExampleAsset(mockSelectAssets[0], 4, {
    title: 'RNA-seq immune cohort sample manifest',
    name: 'immune-rnaseq-manifest.csv',
    scope: 'private',
    location: 'Private',
    description: 'Sample metadata for paired-end RNA sequencing differential expression runs.',
    tags: ['rna-seq', 'manifest', 'immune'],
    properties: { format: 'CSV', samples: '96' },
  }),
  makeExampleAsset(mockSelectAssets[1], 5, {
    title: 'ClinVar pathogenic variants snapshot',
    name: 'clinvar-pathogenic-variants.vcf.gz',
    scope: 'public',
    location: 'Public',
    description: 'ClinVar variant subset used for clinical annotation tests.',
    tags: ['clinvar', 'annotation', 'vcf'],
    properties: { format: 'VCF', source: 'ClinVar' },
  }),
  makeExampleAsset(mockSelectAssets[2], 6, {
    title: 'Long-read structural variant callset',
    name: 'long-read-sv-callset.vcf.gz',
    scope: 'space-123',
    location: 'Space: Oncology Sequencing',
    description: 'Structural variant calls from long-read sequencing for repeat expansion review.',
    tags: ['long-read', 'sv', 'vcf'],
    properties: { format: 'VCF', platform: 'long-read' },
  }),
  makeExampleAsset(mockSelectAssets[0], 7, {
    title: 'FASTQ quality metrics multi-site pilot',
    name: 'fastq-qc-multisite.json',
    scope: 'private',
    location: 'Private',
    description: 'Aggregated QC metrics for lane balance, adapter content, and read quality.',
    tags: ['fastq', 'qc', 'multi-site'],
    properties: { format: 'JSON', sites: '4' },
  }),
  makeExampleAsset(mockSelectAssets[1], 8, {
    title: 'Pharmacogenomics star allele reference table',
    name: 'pgx-star-allele-reference.tsv',
    scope: 'public',
    location: 'Public',
    description: 'Curated star allele definitions for pharmacogenomics interpretation workflows.',
    tags: ['pgx', 'annotation', 'tsv'],
    properties: { format: 'TSV', domain: 'pharmacogenomics' },
  }),
]

const selectAssetHandlers = [
  http.post('/api/list_assets', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { search_string?: string; scopes?: ServerScope[] }
    const searchText = body.search_string?.toLowerCase().trim() ?? ''
    const scopes = body.scopes ?? []

    const assets = exampleSelectAssets.filter(asset => {
      const matchesScope = scopes.length === 0 || scopes.includes(asset.scope as ServerScope)
      const matchesSearch =
        searchText.length === 0 ||
        asset.title.toLowerCase().includes(searchText) ||
        asset.uid.toLowerCase().includes(searchText) ||
        asset.user.full_name.toLowerCase().includes(searchText) ||
        asset.org.name.toLowerCase().includes(searchText)

      return matchesScope && matchesSearch
    })

    return HttpResponse.json(assets)
  }),
]

const meta: Meta = {
  title: 'Modals/Assets',
  decorators: [
    Story => (
      <StorybookProviders>
        <Story />
      </StorybookProviders>
    ),
  ],
}

type Props = {
  dialogType: DialogType
  showSubtitle: boolean
}
type Story = StoryObj<Props>

const SelectAssetModalWrapper = ({ dialogType, showSubtitle }: Props) => {
  const { modalComp, setShowModal } = useSelectAssetModal(
    'Select Asset',
    dialogType,
    (selectedAssets: IAsset[]) => {
      console.log('Selected assets:', selectedAssets)
      alert(`Selected ${selectedAssets.length} asset(s): ${selectedAssets.map(a => a.title).join(', ')}`)
    },
    showSubtitle ? 'Choose assets for your analysis workflow' : undefined,
    ['private', 'public', 'space-123'],
  )

  useEffect(() => {
    setShowModal(true)
  }, [setShowModal])

  return modalComp
}

export const SelectAssetModal: Story = {
  parameters: {
    msw: {
      handlers: selectAssetHandlers,
    },
  },
  render: ({ dialogType = 'checkbox', showSubtitle = true }) => {
    return <SelectAssetModalWrapper dialogType={dialogType} showSubtitle={showSubtitle} />
  },
  argTypes: {
    dialogType: {
      options: ['checkbox', 'radio'] as DialogType[],
      control: { type: 'radio' },
    },
    showSubtitle: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
