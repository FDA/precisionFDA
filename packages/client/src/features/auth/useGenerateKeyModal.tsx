import { useQuery } from '@tanstack/react-query'
import { InfoIcon } from 'lucide-react'
import { useRef } from 'react'
import { Loader } from '@/components/Loader'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useModal } from '../modal/useModal'
import { generateKeyRequest } from './api'

const GenerateKey = ({ handleClose }: { handleClose: () => void }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['generate-key'],
    queryFn: generateKeyRequest,
    staleTime: 60000,
  })

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const copyToClipboard = async () => {
    const val = inputRef.current?.value
    if (val) {
      try {
        await navigator.clipboard.writeText(val)
        toastSuccess('The key has been copied into your clipboard')
      } catch {
        toastError('The key could not be copied to your clipboard')
      }
    }
  }

  return (
    <>
      <div className="min-h-0 overflow-y-auto py-1">
        {isLoading ? (
          <div className="flex h-36 w-full items-center justify-center rounded-md border border-input bg-muted/30">
            <Loader />
          </div>
        ) : (
          <Textarea ref={inputRef} disabled value={data?.Key} className="h-36 resize-none font-mono text-xs" />
        )}
      </div>
      <div className="flex flex-col justify-between gap-2 text-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <InfoIcon className="size-4" />
          This key will expire in 24 hours
        </div>
        <a
          className="text-primary underline underline-offset-3"
          target="_blank"
          rel="noreferrer"
          href="/docs/guides/cli"
        >
          CLI Documentation
        </a>
      </div>
      <DialogFooter className="sm:justify-between">
        <Button disabled={isLoading || !data?.Key} onClick={copyToClipboard}>
          Copy to Clipboard
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  )
}

export const useGenerateKeyModal = () => {
  const { isShown, setShowModal } = useModal()
  const handleClose = () => setShowModal(false)

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="generate-key" data-testid="generate-key" variant="medium" className="gap-4">
        <DialogHeader>
          <DialogTitle>CLI Authentication Key</DialogTitle>
        </DialogHeader>
        <GenerateKey handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
