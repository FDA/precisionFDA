
export enum DatabaseListActions {
  'Create Database' = 'Create Database',
}

export interface Links {
  show: string;
  user: string;
  attach_to: string;
  publish: string;
  copy: string;
  run_workflow: string;
  batch_run_workflow: string;
  edit: string;
  fork: string;
  cwl_export: string;
  wdl_export: string;
  set_tags: string;
  set_tags_target: string;
  delete: string;
  create: string;
  update: string;
  track: string;
  start: string;
  stop: string;
  terminate: string;
  license: string;
  detach_license: string;
}

export type DBStatus = 'available' | 'stopped' | 'stopping' | 'starting' | 'terminating' | 'terminated'

export interface IDatabase {
  id: string;
  dxid: string;
  uid: string;
  name: string;
  title: string;
  status: DBStatus;
  location: string;
  scope_name: string;
  description: string;
  added_by: string;
  added_by_fullname: string;
  created_at: Date;
  created_at_date_time: string;
  engine: string;
  engine_version: string;
  dx_instance_class: string;
  status_as_of: Date;
  status_updated_date_time: string;
  host: string;
  port: string;
  show_license_pending: boolean;
  tags: any[];
  links: Links;
  scope: string;
}

export type MethodType = 'start' | 'stop' | 'terminate'
