import axios from 'axios'
import { useMutation } from '@tanstack/react-query'

type ItemType = {
  id: string | number;
  type: any;
}

export async function attachToRequest({ items, noteUids }: { items: ItemType[], noteUids: string[] }) {
  return axios.post('/api/attach_to_notes', {
    items,
    note_uids: noteUids,
  })
}

export const useAttachToMutation = () => useMutation({
  mutationKey: ['attach-to'],
  mutationFn: (args: { items: ItemType[], noteUids: string[] }) => attachToRequest(args),
})
