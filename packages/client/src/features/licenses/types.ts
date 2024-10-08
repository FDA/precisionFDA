
export interface License {
  id: string;
  uid: string;
  content: string;
  title: string;
  added_by: string;
  added_by_fullname: string;
  created_at: Date;
  created_at_date_time: string;
  location: string;
  approval_required: boolean;
  tags: any[];
  state: string;
}

export interface UserLicense {
  id: string;
  license: License; // license object
  user: number; // user id
  state: string;
  message: string;
}