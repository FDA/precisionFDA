import { ResourceScope } from "../types";

export enum AppActions {
  "Run" = "Run",
  "Run batch" = "Run batch",
  "Track" = "Track",
  "Edit" = "Edit",
  "Fork" = "Fork",
  "Export to" = "Export to",
  "Make public" = "Make public",
  "Feature" = "Feature",
  "Unfeature" = "Unfeature",
  "Delete" = "Delete",
  "Copy to space" = "Copy to space",
  "Attach to..." = "Attach to...",
}

export enum AppsListActions {
  'Create App' = 'Create App',
}

export interface Links {
  show: string;
  user: string;
  jobs: string;
  track: string;
  fork: string;
  export: string;
  cwl_export: string;
  wdl_export: string;
  copy: string;
  attach_to: string;
  delete: string;
  edit: string;
  edit_tags: string;
  assign_app: string;
  publish: string;
  run_job: string;
  batch_run: string;
  space?: string;
  feature?: string;
  comments?: string;
}

export interface IApp {
  id: string;
  uid: string;
  dxid: string;
  entity_type: string;
  name: string;
  title: string;
  added_by: string;
  added_by_fullname: string;
  created_at: string;
  created_at_date_time: string;
  updated_at: Date;
  location: ResourceScope | 'Private';
  readme: string;
  revision: number;
  app_series_id: number;
  run_by_you: string;
  job_count: number;
  org: string;
  explorers: number;
  featured: boolean;
  active: boolean;
  links: Links;
  tags: any[];
}

