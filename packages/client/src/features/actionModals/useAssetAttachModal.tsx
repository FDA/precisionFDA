import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Loader } from '@/components/Loader'
import { Markdown, MarkdownStyle } from '@/components/Markdown'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderClose,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/utils/cn'
import { useModal } from '../modal/useModal'
import { type Asset, useListAssetsQuery } from './AttachToModal/useListAssetsQuery'

interface AssetAttachModalProps {
  hideAction: () => void
  isShown: boolean
  values: Asset[]
  onChange: (assets: Asset[]) => void
}

export const AssetAttachModal = ({ hideAction, isShown, values, onChange }: AssetAttachModalProps) => {
  const { data: notesData, isLoading } = useListAssetsQuery()
  const items = notesData || []
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<Asset>()
  const [checkedItem, setCheckedItem] = useState(new Set(values.map(v => v.uid)))

  useEffect(() => {
    if (items.length) setSelectedItem(items[0])
  }, [items])

  const onCheckboxClick = (item: Asset) => {
    const newSet = new Set(checkedItem)
    if (newSet.has(item.uid)) {
      newSet.delete(item.uid)
    } else {
      newSet.add(item.uid)
    }
    setCheckedItem(newSet)
  }

  const onClickAttachAction = () => {
    if (onChange) onChange(items.filter(item => checkedItem.has(item.uid)))
    hideAction()
  }

  const reg = new RegExp(search, 'i')
  const filteredItems = search ? items.filter(e => reg.test(e.title)) : items

  return (
    <Dialog open={isShown} onOpenChange={open => !open && hideAction()}>
      <DialogContent
        id="modal-attachto-asset"
        data-testid="modal-attachto-asset"
        variant="large"
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="mx-0 flex-row items-center justify-between gap-2 px-4 py-3">
          <DialogTitle className="min-w-0 truncate">Manage your Assets for your VM Environment</DialogTitle>
          <DialogHeaderClose />
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <Loader />
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
              <div className="border-border flex min-h-0 w-full shrink-0 flex-col border-b md:w-87.5 md:border-r md:border-b-0">
                <div className="border-border shrink-0 border-b p-3">
                  <InputGroup>
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                      name="search"
                      placeholder="Search..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      autoComplete="off"
                    />
                    {search ? (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setSearch('')}>
                          <X />
                        </InputGroupButton>
                      </InputGroupAddon>
                    ) : null}
                  </InputGroup>
                </div>

                <ul className="min-h-0 flex-1 list-none overflow-y-auto p-0 m-0">
                  {filteredItems.map(item => {
                    const isSelected = item.uid === selectedItem?.uid
                    const isChecked = checkedItem.has(item.uid)

                    return (
                      <li key={item.uid} className="border-border border-t first:border-t-0">
                        <button
                          type="button"
                          aria-pressed={isChecked}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-4 py-2 text-left transition-colors',
                            isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/60',
                          )}
                          onClick={() => {
                            setSelectedItem(item)
                            onCheckboxClick(item)
                          }}
                        >
                          <Checkbox checked={isChecked} tabIndex={-1} className="pointer-events-none" aria-hidden />
                          <span className="text-primary shrink-0 text-[75%] font-bold uppercase">{item.className}</span>
                          <span className="min-w-0 truncate font-normal">{item.title}</span>
                        </button>
                      </li>
                    )
                  })}
                  {!filteredItems.length && (
                    <li className="flex flex-col items-start gap-2 px-4 py-3">
                      <span className="text-muted-foreground">No results found</span>
                      <Button variant="link" className="h-auto p-0" onClick={() => setSearch('')}>
                        Clear query
                      </Button>
                    </li>
                  )}
                </ul>
              </div>

              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
                {selectedItem && (
                  <>
                    <div className="border-border mb-4 border-b pb-4">
                      <a
                        href={selectedItem.path}
                        className="text-foreground text-2xl font-semibold no-underline! hover:underline!"
                      >
                        {selectedItem.title}
                      </a>
                    </div>
                    {selectedItem.content ? (
                      <MarkdownStyle>
                        <Markdown data={selectedItem.content} />
                      </MarkdownStyle>
                    ) : (
                      <div className="text-muted-foreground">No content written for this item</div>
                    )}
                  </>
                )}
              </div>
            </div>

            <DialogFooter className="mx-0 shrink-0 px-4 py-3">
              <Button variant="outline" onClick={hideAction}>
                Cancel
              </Button>
              <Button onClick={onClickAttachAction}>Confirm</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function useAssetAttachModal(value: Asset[], onChange: (a: Asset[]) => void) {
  const { isShown, setShowModal } = useModal()
  const modalComp = (
    <AssetAttachModal onChange={onChange} isShown={isShown} hideAction={() => setShowModal(false)} values={value} />
  )
  return { modalComp, setShowModal, isShown }
}
