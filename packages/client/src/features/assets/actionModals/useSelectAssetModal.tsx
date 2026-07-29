import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { FileIcon } from '../../../components/icons/FileIcon'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { useDebounce } from '../../../components/Table/useDebounce'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Switch } from '../../../components/ui/switch'
import { Table, TableBody, TableCell, TableRow } from '../../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useAuthUser } from '../../auth/useAuthUser'
import type { DialogType, ServerScope } from '../../home/types'
import { useModal } from '../../modal/useModal'
import { fetchFilteredAssets } from '../assets.api'
import type { IAsset } from '../assets.types'

const Row = ({
  asset,
  type,
  viewOnly,
  radioCallback,
  checkboxCallback,
  checked,
}: {
  asset: IAsset
  type: DialogType
  viewOnly: boolean
  radioCallback: (asset: IAsset) => void
  checkboxCallback: (checked: boolean, asset: IAsset) => void
  checked?: boolean
}) => (
  <TableRow
    className="cursor-pointer hover:bg-muted/50"
    onClick={() => {
      if (!viewOnly) {
        if (type === 'radio') {
          radioCallback(asset)
        } else if (type === 'checkbox') {
          checkboxCallback(!checked, asset)
        }
      }
    }}
  >
    <TableCell className="whitespace-normal px-3 py-2">
      <div className="flex items-start gap-2 text-foreground">
        {type === 'radio' && !viewOnly && (
          <div className="mr-2 shrink-0 pt-0.5">
            <Radio checked={checked} onChange={() => {}} />
          </div>
        )}
        {type === 'checkbox' && !viewOnly && (
          <div className="mr-2 shrink-0 pt-0.5">
            <Checkbox
              checked={checked}
              onCheckedChange={isChecked => checkboxCallback(isChecked, asset)}
              onClick={event => event.stopPropagation()}
            />
          </div>
        )}
        <div className="min-w-0">
          <div className="break-all">
            <span className="inline-block align-text-bottom">
              <FileIcon width={14} height={14} />
            </span>{' '}
            <span>{asset.title}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[85%] leading-5 text-muted-foreground">
            {asset.public && (
              <span className="inline-flex items-center">
                <GlobeIcon height={13} />
              </span>
            )}
            {asset.private && <span>Private</span>}
            {asset.public && <span>Public</span>}
            <span>{asset.location}</span>
            <span>{asset.user.full_name}</span>
            <span>{asset.org.name}</span>
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell className="w-10 px-2 py-2 align-top">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-primary"
        render={
          <a href={asset.path} aria-label={`Open ${asset.title}`} onClick={event => event.stopPropagation()}>
            <span className="sr-only">Open {asset.title}</span>
          </a>
        }
      >
        <ExternalLink className="size-4 shrink-0" />
      </Button>
    </TableCell>
  </TableRow>
)

/**
 * Dialog for selecting assets(s). It can function in two modes specified
 * by DialogType. In Radio mode only single asset selection is allowed, however
 * in checkbox mode it allows user select multiple assets.
 *
 * @returns list of selected assets
 */
export const useSelectAssetModal = (
  title: string,
  type: DialogType,
  handleSelect: (assets: IAsset[]) => void,
  subtitle?: string,
  scopes?: ServerScope[],
) => {
  const user = useAuthUser()
  const listedAssets: IAsset[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedAssets, setSelectedAssets] = useState(listedAssets)
  const [filter, setFilter] = useState('')
  const [showOnlyMyAssets, setShowOnlyMyAssets] = useState(false)
  const searchText = useDebounce(filter, 250)

  const {
    data: assetsData,
    isLoading: isLoadingAssets,
    status: loadingAssetsStatus,
  } = useQuery({
    queryKey: ['list_assets', searchText],
    queryFn: () => fetchFilteredAssets(searchText, scopes), // scopes: [] mean all scopes.
    enabled: isShown,
  })

  const radioCallback = (asset: IAsset) => {
    setSelectedAssets([asset])
  }

  const addAsset = (asset: IAsset) => {
    setSelectedAssets(prev => [...prev, asset])
  }

  const removeAsset = (asset: IAsset) => {
    setSelectedAssets(prev => [...prev.filter(item => asset.id !== item.id)])
  }

  const checkboxCallback = (checked: boolean, asset: IAsset) => {
    if (checked) {
      addAsset(asset)
    } else {
      removeAsset(asset)
    }
  }

  const showModalResetState = () => {
    setSelectedAssets([])
    setShowModal(true)
  }

  const toggleOnlyMine = (isChecked: boolean) => {
    if (isChecked) {
      setShowOnlyMyAssets(true)
    } else {
      setShowOnlyMyAssets(false)
    }
  }

  const handleSubmit = () => {
    handleSelect(selectedAssets)
    setShowModal(false)
    setFilter('')
  }

  const isMyAsset = (asset: IAsset): boolean => asset.user.dxuser === user?.dxuser

  const assets = assetsData ?? []

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="select-asset-modal"
        variant="medium"
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {subtitle && <div className="text-muted-foreground text-sm leading-5">{subtitle}</div>}
        <Tabs defaultValue="assets" className="min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="assets">Assets {assets.length}</TabsTrigger>
            <TabsTrigger value="selected">Selected {selectedAssets.length}</TabsTrigger>
          </TabsList>
          <TabsContent value="assets" className="flex min-h-0 min-w-[min(400px,100%)] flex-1 flex-col overflow-hidden">
            <div className="flex flex-row items-start gap-2 pb-3">
              <Input className="flex-1" placeholder="Filter..." onChange={evt => setFilter(evt.target.value)} />
              <label
                htmlFor="select-assets-only-mine"
                className="flex shrink-0 flex-col items-center gap-1 text-muted-foreground text-xs font-medium"
              >
                <Switch id="select-assets-only-mine" checked={showOnlyMyAssets} onCheckedChange={toggleOnlyMine} />
                <span>Mine only</span>
              </label>
            </div>
            {isLoadingAssets && <Loader />}
            {loadingAssetsStatus === 'success' && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {assets
                      .filter((asset: IAsset) => (showOnlyMyAssets ? isMyAsset(asset) && showOnlyMyAssets : true))
                      .map((asset: IAsset) => (
                        <Row
                          asset={asset}
                          type={type}
                          viewOnly={false}
                          key={asset.id}
                          radioCallback={radioCallback}
                          checkboxCallback={checkboxCallback}
                          checked={selectedAssets.some(selected => asset.id === selected.id)}
                        />
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent
            value="selected"
            className="flex min-h-0 min-w-[min(400px,100%)] flex-1 flex-col overflow-hidden"
          >
            {selectedAssets.length === 0 && (
              <div className="border-t px-3 py-2 text-foreground">No selected assets</div>
            )}
            {selectedAssets.length > 0 && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {selectedAssets.map(asset => (
                      <Row
                        asset={asset}
                        type={type}
                        viewOnly
                        key={asset.id}
                        radioCallback={radioCallback}
                        checkboxCallback={checkboxCallback}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedAssets?.length === 0}>
            Select &nbsp;
            <span className="rounded-[10px] bg-primary-foreground/20 px-1.75 py-0.75 leading-none">
              {selectedAssets?.length}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
