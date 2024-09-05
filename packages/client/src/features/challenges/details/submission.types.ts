
export interface Extras {
  has_seen_guidelines: boolean;
}

export interface PricingMap {
  'gpu - 8': number;
  'himem - 2': number;
  'himem - 4': number;
  'himem - 8': number;
  'hidisk - 2': number;
  'hidisk - 4': number;
  'hidisk - 8': number;
  'himem - 16': number;
  'himem - 32': number;
  'hidisk - 16': number;
  'hidisk - 36': number;
  'baseline - 2': number;
  'baseline - 4': number;
  'baseline - 8': number;
  'db_mem1_x2': number;
  'db_mem1_x4': number;
  'db_mem1_x8': number;
  'db_std1_x2': number;
  'baseline - 16': number;
  'baseline - 36': number;
  'db_mem1_x16': number;
  'db_mem1_x32': number;
  'db_mem1_x48': number;
  'db_mem1_x64': number;
}

export interface ChargesBaseline {
  computeCharges: number;
  storageCharges: number;
  dataEgressCharges: number;
}

export interface CloudResourceSettings {
  job_limit: number;
  resources: string[];
  pricing_map: PricingMap;
  total_limit: number;
  charges_baseline: ChargesBaseline;
}

export interface User {
  id: number;
  dxuser: string;
  private_files_project: string;
  public_files_project: string;
  private_comparisons_project: string;
  public_comparisons_project: string;
  schema_version: number;
  created_at: Date;
  updated_at: Date;
  org_id: number;
  first_name: string;
  last_name: string;
  email: string;
  normalized_email: string;
  last_login: Date;
  extras: Extras;
  time_zone: string;
  review_app_developers_org: string;
  user_state: string;
  expiration: number;
  disable_message?: any;
  cloud_resource_settings: CloudResourceSettings;
}

export interface RunInputData {
  name: string;
  value: string;
}

type JobState = 'done' | 'failed' | 'idle' | 'running' | 'terminated' | 'terminating'

export interface Submission {
  id: number;
  name: string;
  challenge_id: number;
  desc: string;
  created_at: string;
  updated_at: string;
  user: User;
  inputs: any[];
  job_state: JobState;
  job_name: string;
  job_input_files: any[];
  run_input_data: RunInputData[];
  user_can_access_space: boolean;
}



