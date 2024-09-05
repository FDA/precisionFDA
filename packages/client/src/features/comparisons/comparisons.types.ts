import { FileOrg, FileUser } from '../apps/apps.types'
import { ServerScope } from '../home/types'

export interface IComparison {
  id: number;
  uid: string;
  className: string;
  scope: ServerScope;
  path: string;
  owned: boolean;
  editable: boolean;
  accessible: boolean;
  file_path: string;
  parent_folder_name: string;
  public: boolean;
  private: boolean;
  in_space: boolean;
  space_private: boolean;
  space_public: boolean;
  title: string;
  name: string;
  prefix: string;
  description: string;
  file_paths: string[];
  user: FileUser;
  org: FileOrg;
}