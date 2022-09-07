export enum AppActions {
  "Run" = "Run",
  "Run batch" = "Run batch",
  "Track" = "Track",
  "Edit" = "Edit",
  "Fork" = "Fork",
  "Export to" = "Export to",
  "Make public" = "Make public",
  "Delete" = "Delete",
  "Copy to space" = "Copy to space",
  "Attach to..." = "Attach to...",
}

export enum AppsListActions {
  'Create App' = 'Create App',
}

export interface Links {
  show?: string;
  user?: string;
  jobs?: string;
  track?: string;
  fork?: string;
  export?: string;
  cwl_export?: string;
  wdl_export?: string;
  copy?: string;
  attach_to?: string;
  delete?: string;
  remove?: string;
  edit?: string;
  feature?: string;
  download?: string;
  edit_tags?: string;
  assign_app?: string;
  publish?: string;
  run_job?: string;
  batch_run?: string;
  space?: string;
  show_license?: string;
  license?: string;
  detach_license?: string;
  request_approval_license?: string;
  accept_license_action?: string;
}

export interface FileLicense {
  id: string;
  title: string;
  uid: string;
}

export interface IAsset {
  id: string;
  uid: string;
  dxid: string;
  entity_type: string;
  file_size: string;
  file_license: FileLicense,
  show_license_pending: boolean,
  name: string;
  title: string;
  description: string;
  added_by: string;
  added_by_fullname: string;
  archive_content: string[];
  created_at: string;
  created_at_date_time: string;
  updated_at: Date;
  location: string;
  readme: string;
  revision: number;
  app_series_id: number;
  run_by_you: string;
  org: string;
  origin: {
    text?: string
    fa?: string
    href?: string
  } | string,
  explorers: number;
  featured: boolean;
  active: boolean;
  links: Links;
  tags: any[];
}

