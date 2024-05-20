import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ServerScope } from '../../home/types'

export interface Note {
  id: number;
  uid: string;
  className: string;
  fa_class: string;
  scope: ServerScope;
  path: string;
  owned: boolean;
  editable: boolean;
  accessible: boolean;
  file_path?: any;
  parent_folder_name?: any;
  public: boolean;
  private: boolean;
  in_space: boolean;
  space_private: boolean;
  space_public: boolean;
  title: string;
  note_type?: any;
  content: string;
}

type ListNotesResponse = Note[]


export async function listNotesRequest() {
  return axios.post('/api/list_notes', {
    editable: true,
    fields: ['title', 'note_type'],  
  }).then(r => r.data as ListNotesResponse)
}

export const useListNotesQuery = () => useQuery({
  queryKey: ['list-notes'],
  queryFn: () => listNotesRequest(),
})
