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
import { fetchFilteredComparisons } from '../comparisons.api'
import type { IComparison } from '../comparisons.types'

const Row = ({
  comparison,
  type,
  viewOnly,
  radioCallback,
  checkboxCallback,
  checked,
}: {
  comparison: IComparison
  type: DialogType
  viewOnly: boolean
  radioCallback: (comparison: IComparison) => void
  checkboxCallback: (checked: boolean, comparison: IComparison) => void
  checked?: boolean
}) => (
  <TableRow
    className="cursor-pointer hover:bg-muted/50"
    onClick={() => {
      if (!viewOnly) {
        if (type === 'radio') {
          radioCallback(comparison)
        } else if (type === 'checkbox') {
          checkboxCallback(!checked, comparison)
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
              onCheckedChange={isChecked => checkboxCallback(isChecked, comparison)}
              onClick={event => event.stopPropagation()}
            />
          </div>
        )}
        <div className="min-w-0">
          <div className="break-all">
            <span className="inline-block align-text-bottom">
              <FileIcon width={14} height={14} />
            </span>{' '}
            <span>{comparison.title}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[85%] leading-5 text-muted-foreground">
            {comparison.public && (
              <span className="inline-flex items-center">
                <GlobeIcon height={13} />
              </span>
            )}
            {comparison.private && <span>Private</span>}
            {comparison.public && <span>Public</span>}
            <span>{comparison.user.full_name}</span>
            <span>{comparison.org.name}</span>
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
          <a href={comparison.path} aria-label={`Open ${comparison.title}`} onClick={event => event.stopPropagation()}>
            <span className="sr-only">Open {comparison.title}</span>
          </a>
        }
      >
        <ExternalLink className="size-4 shrink-0" />
      </Button>
    </TableCell>
  </TableRow>
)

/**
 * Dialog for selecting comparison(s). It can function in two modes specified
 * by DialogType. In Radio mode only single comparison selection is allowed, however
 * in checkbox mode it allows user select multiple comparisons.
 *
 * @returns list of selected comparisons
 */
export const useSelectComparisonModal = (
  title: string,
  type: DialogType,
  handleSelect: (comparisons: IComparison[]) => void,
  subtitle?: string,
  scopes: ServerScope[] = [],
) => {
  const user = useAuthUser()
  const listedComparisons: IComparison[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedComparisons, setSelectedComparisons] = useState(listedComparisons)
  const [filter, setFilter] = useState('')
  const [showOnlyMyComparisons, setShowOnlyMyComparisons] = useState(false)
  const searchText = useDebounce(filter, 250)

  const {
    data: comparisonsData,
    isLoading: isLoadingComparisons,
    status: loadingComparisonsStatus,
  } = useQuery({
    queryKey: ['list_comparisons', searchText],
    queryFn: () => fetchFilteredComparisons(searchText, scopes), // scopes: [] mean all scopes.
    enabled: isShown,
  })

  const radioCallback = (comparison: IComparison) => {
    setSelectedComparisons([comparison])
  }

  const addComparision = (comparison: IComparison) => {
    setSelectedComparisons(prev => [...prev, comparison])
  }

  const removeComparison = (comparison: IComparison) => {
    setSelectedComparisons(prev => [...prev.filter(item => comparison.id !== item.id)])
  }

  const checkboxCallback = (checked: boolean, comparison: IComparison) => {
    if (checked) {
      addComparision(comparison)
    } else {
      removeComparison(comparison)
    }
  }

  const showModalResetState = () => {
    setSelectedComparisons([])
    setShowModal(true)
  }

  const toggleOnlyMine = (isChecked: boolean) => {
    if (isChecked) {
      setShowOnlyMyComparisons(true)
    } else {
      setShowOnlyMyComparisons(false)
    }
  }

  const handleSubmit = () => {
    handleSelect(selectedComparisons)
    setShowModal(false)
  }

  const isMyComparison = (comparison: IComparison): boolean => comparison.user.dxuser === user?.dxuser

  const comparisons = comparisonsData ?? []

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="select-comparison-modal"
        variant="medium"
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {subtitle && <div className="text-muted-foreground text-sm leading-5">{subtitle}</div>}
        <Tabs defaultValue="comparisons" className="min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="comparisons">Comparisons {comparisons.length}</TabsTrigger>
            <TabsTrigger value="selected">Selected {selectedComparisons.length}</TabsTrigger>
          </TabsList>
          <TabsContent
            value="comparisons"
            className="flex min-h-0 min-w-[min(400px,100%)] flex-1 flex-col overflow-hidden"
          >
            <div className="flex flex-row items-start gap-2 pb-3">
              <Input className="flex-1" placeholder="Filter..." onChange={evt => setFilter(evt.target.value)} />
              <label
                htmlFor="select-comparisons-only-mine"
                className="flex shrink-0 flex-col items-center gap-1 text-muted-foreground text-xs font-medium"
              >
                <Switch
                  id="select-comparisons-only-mine"
                  checked={showOnlyMyComparisons}
                  onCheckedChange={toggleOnlyMine}
                />
                <span>Mine only</span>
              </label>
            </div>
            {isLoadingComparisons && <Loader />}
            {loadingComparisonsStatus === 'success' && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {comparisons
                      .filter((comparison: IComparison) =>
                        showOnlyMyComparisons ? isMyComparison(comparison) && showOnlyMyComparisons : true,
                      )
                      .map((comparison: IComparison) => (
                        <Row
                          comparison={comparison}
                          type={type}
                          viewOnly={false}
                          key={comparison.id}
                          radioCallback={radioCallback}
                          checkboxCallback={checkboxCallback}
                          checked={selectedComparisons.some(selected => comparison.id === selected.id)}
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
            {selectedComparisons.length === 0 && (
              <div className="border-t px-3 py-2 text-foreground">No selected comparisons</div>
            )}
            {selectedComparisons.length > 0 && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {selectedComparisons.map(comparison => (
                      <Row
                        comparison={comparison}
                        type={type}
                        viewOnly
                        key={comparison.id}
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
          <Button onClick={handleSubmit} disabled={selectedComparisons?.length === 0}>
            Select &nbsp;
            <span className="rounded-[10px] bg-primary-foreground/20 px-1.75 py-0.75 leading-none">
              {selectedComparisons?.length}
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
