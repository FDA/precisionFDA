import { http, HttpResponse } from 'msw'
import { SubmissionV2 } from '../../features/challenges/details/submission.types'

export const mockChallengeSubmissions: SubmissionV2[] = [
  {
    id: 1,
    name: 'Genomic Analysis Pipeline v1.2',
    description: 'A comprehensive genomic analysis pipeline for variant calling and annotation',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    user: {
      id: 101,
      dxuser: 'researcher_john',
      firstName: 'John',
      lastName: 'Smith',
      fullName: 'John Smith',
    },
    job: {
      id: 501,
      uid: 'job-GJF8jqQ0J9p0123456789',
      name: 'genomic_analysis_v1_2',
      state: 'done',
      inputFiles: [
        {
          id: 1001,
          name: 'sample_data.vcf',
          scope: 'public',
          uid: 'file-GJF8jqQ0J9p0123456789',
          userId: 101,
        },
      ],
    },
  },
  {
    id: 2,
    name: 'Machine Learning Model Training for Protein Structure Prediction and Analysis',
    description: 'Training a deep learning model for protein structure prediction',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    user: {
      id: 102,
      dxuser: 'ml_expert_jane',
      firstName: 'Jane',
      lastName: 'Doe',
      fullName: 'Jane Doe',
    },
    job: {
      id: 502,
      uid: 'job-HKG9krR1K0q1234567890',
      name: 'ml_model_training',
      state: 'running',
      inputFiles: [
        {
          id: 1002,
          name: 'training_dataset.csv',
          scope: 'private',
          uid: 'file-HKG9krR1K0q1234567890',
          userId: 102,
        },
        {
          id: 1003,
          name: 'validation_dataset.csv',
          scope: 'private',
          uid: 'file-ILH0lsS2L1r2345678901',
          userId: 102,
        },
      ],
    },
  },
  {
    id: 3,
    name: 'Statistical Analysis Workflow',
    description: 'Comprehensive statistical analysis of clinical trial data',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    user: {
      id: 103,
      dxuser: 'stats_analyst',
      firstName: 'Alice',
      lastName: 'Johnson',
      fullName: 'Alice Johnson',
    },
    job: {
      id: 503,
      uid: 'job-JMI1mtT3M2s2345678901',
      name: 'statistical_analysis',
      state: 'failed',
      inputFiles: [
        {
          id: 1004,
          name: 'clinical_data.xlsx',
          scope: 'private',
          uid: 'file-JMI1mtT3M2s2345678901',
          userId: 103,
        },
      ],
    },
  },
  {
    id: 4,
    name: 'Bioinformatics Pipeline Beta',
    description: 'A new experimental pipeline for RNA-seq analysis with enhanced algorithms',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    user: {
      id: 104,
      dxuser: 'bio_dev_team',
      firstName: 'Development',
      lastName: 'Team',
      fullName: 'Development Team',
    },
    job: {
      id: 504,
      uid: 'job-KNJ2nuU4N3t3456789012',
      name: 'bioinformatics_pipeline_beta',
      state: 'idle',
      inputFiles: [
        {
          id: 1005,
          name: 'rnaseq_samples.fastq',
          scope: 'public',
          uid: 'file-KNJ2nuU4N3t3456789012',
          userId: 104,
        },
      ],
    },
  },
  {
    id: 5,
    name: 'Data Preprocessing Suite',
    description: 'Quality control and preprocessing of large-scale genomic datasets',
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T13:20:00Z',
    user: {
      id: 105,
      dxuser: 'data_engineer',
      firstName: 'Bob',
      lastName: 'Wilson',
      fullName: 'Bob Wilson',
    },
    job: {
      id: 505,
      uid: 'job-LOK3ovV5O4u4567890123',
      name: 'data_preprocessing',
      state: 'terminating',
      inputFiles: [
        {
          id: 1006,
          name: 'raw_genomic_data.tar.gz',
          scope: 'public',
          uid: 'file-LOK3ovV5O4u4567890123',
          userId: 105,
        },
      ],
    },
  },
]

export const mockEmptySubmissions: SubmissionV2[] = []

export const challengeHandlers = [
  http.get('/api/v2/challenges/:challengeId/entries', ({ params }) => {
    const { challengeId } = params
    
    switch (challengeId) {
      case 'empty':
        return HttpResponse.json(mockEmptySubmissions)
      default:
        return HttpResponse.json(mockChallengeSubmissions)
    }
  }),
]
