import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import { syncFilesRequest } from './executions.api';


export const useSyncFilesMutation = () => {
  return useMutation({
    mutationFn: syncFilesRequest,
    onSuccess: ({ message }) => {
      if (message) {
        if (message.type === 'success') {
          toast.success(message.text)
        } else if (message.type === 'warning') {
          toast.success(message.text)
        }
      }
    },
    onError: () => {
      toast.error('Error requesting worktation file sync')
    }
  })
}
