export interface Org {
  id: number;
  title: string;
  image_url: string;
  public?: boolean;
  kind: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface ParticipantsResponse {
  orgs: Org[];
}
