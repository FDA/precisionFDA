import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { CubeIcon } from '../../../components/icons/CubeIcon'
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
import { getBasePathFromScope } from '../../home/utils'
import { useModal } from '../../modal/useModal'
import { fetchFilteredApps } from '../apps.api'
import type { IApp } from '../apps.types'

type AppOrgLike = string | { name?: string; handle?: string } | null | undefined

const getOrgLabel = (org: AppOrgLike): string => (typeof org === 'string' ? org : (org?.name ?? org?.handle ?? ''))

const Row = ({
  app,
  type,
  viewOnly,
  radioCallback,
  checkboxCallback,
  checked,
}: {
  app: IApp
  type: DialogType
  viewOnly: boolean
  radioCallback: (app: IApp) => void
  checkboxCallback: (checked: boolean, app: IApp) => void
  checked?: boolean
}) => (
  <TableRow
    className="cursor-pointer hover:bg-muted/50"
    onClick={() => {
      if (!viewOnly) {
        if (type === 'radio') {
          radioCallback(app)
        } else if (type === 'checkbox') {
          checkboxCallback(!checked, app)
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
          <Checkbox
            className="mr-2"
            checked={checked}
            onCheckedChange={isChecked => checkboxCallback(isChecked, app)}
            onClick={event => event.stopPropagation()}
          />
        )}
        <div className="min-w-0">
          <div className="break-all">
            <span className="inline-block align-text-bottom">
              <CubeIcon height={14} />
            </span>{' '}
            <span>{app.title}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[85%] leading-5 text-muted-foreground">
            <span>{app.location}</span>
            <span>Revision {app.revision}</span>
            <span>{app.user.full_name}</span>
            <span>{getOrgLabel(app.org)}</span>
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
          <a
            href={`${getBasePathFromScope(app.scope)}/apps/${app.uid}`}
            aria-label={`Open ${app.title}`}
            onClick={event => event.stopPropagation()}
          >
            <span className="sr-only">Open {app.title}</span>
          </a>
        }
      >
        <ExternalLink className="size-4 shrink-0" />
      </Button>
    </TableCell>
  </TableRow>
)

/**
 * Dialog for selecting apps(s). It can function in two modes specified
 * by DialogType. In Radio mode only single app selection is allowed, however
 * in checkbox mode it allows user select multiple apps.
 *
 * @returns list of selected apps
 */
export const useSelectAppModal = (
  title: string,
  type: DialogType,
  handleSelect: (apps: IApp[]) => void,
  subtitle?: string,
  scopes?: ServerScope[],
) => {
  const user = useAuthUser()
  const listedApps: IApp[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedApps, setSelectedApps] = useState(listedApps)
  const [filter, setFilter] = useState('')
  const [showOnlyMyApps, setShowOnlyMyApps] = useState(false)
  const searchText = useDebounce(filter, 250)

  const {
    data: appsData,
    isLoading: isLoadingApps,
    status: loadingAppsStatus,
  } = useQuery({
    queryKey: ['list_apps', searchText],
    queryFn: () => fetchFilteredApps(searchText, scopes || []),
    enabled: isShown,
  })

  const radioCallback = (app: IApp) => {
    setSelectedApps([app])
  }

  const addApp = (app: IApp) => {
    setSelectedApps(prev => [...prev, app])
  }

  const removeApp = (app: IApp) => {
    setSelectedApps(prev => [...prev.filter(item => app.id !== item.id)])
  }

  const checkboxCallback = (checked: boolean, app: IApp) => {
    if (checked) {
      addApp(app)
    } else {
      removeApp(app)
    }
  }

  const showModalResetState = () => {
    setSelectedApps([])
    setShowModal(true)
  }

  const toggleOnlyMine = (isChecked: boolean) => {
    if (isChecked) {
      setShowOnlyMyApps(true)
    } else {
      setShowOnlyMyApps(false)
    }
  }

  const handleSubmit = () => {
    handleSelect(selectedApps)
    setShowModal(false)
    setFilter('')
  }

  const isMyApp = (app: IApp): boolean => app.user.dxuser === user?.dxuser

  const apps = appsData ?? []

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="select-app-modal"
        data-testid="select-app-modal"
        variant="medium"
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {subtitle && <div className="text-muted-foreground text-sm leading-5">{subtitle}</div>}
        <Tabs defaultValue="apps" className="min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="apps">Apps {apps.length}</TabsTrigger>
            <TabsTrigger value="selected">Selected {selectedApps.length}</TabsTrigger>
          </TabsList>
          <TabsContent value="apps" className="flex min-h-0 min-w-[min(400px,100%)] flex-1 flex-col overflow-hidden">
            <div className="flex flex-row items-start gap-2 pb-3">
              <Input className="flex-1" placeholder="Filter..." onChange={evt => setFilter(evt.target.value)} />
              <label
                htmlFor="select-apps-only-mine"
                className="flex shrink-0 flex-col items-center gap-1 text-muted-foreground text-xs font-medium"
              >
                <Switch id="select-apps-only-mine" checked={showOnlyMyApps} onCheckedChange={toggleOnlyMine} />
                <span>Mine only</span>
              </label>
            </div>
            {isLoadingApps && <Loader />}
            {loadingAppsStatus === 'success' && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {apps
                      .filter((app: IApp) => (showOnlyMyApps ? isMyApp(app) && showOnlyMyApps : true))
                      .map((app: IApp) => (
                        <Row
                          app={app}
                          type={type}
                          viewOnly={false}
                          key={app.id}
                          radioCallback={radioCallback}
                          checkboxCallback={checkboxCallback}
                          checked={selectedApps.some(selected => app.id === selected.id)}
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
            {selectedApps.length === 0 && <div className="border-t px-3 py-2 text-foreground">No selected apps</div>}
            {selectedApps.length > 0 && (
              <div className="min-h-0 flex-1 overflow-auto">
                <Table>
                  <TableBody>
                    {selectedApps.map(app => (
                      <Row
                        app={app}
                        type={type}
                        viewOnly
                        key={app.id}
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
          <Button onClick={handleSubmit} disabled={selectedApps?.length === 0}>
            Select &nbsp;
            <span className="rounded-[10px] bg-primary-foreground/20 px-1.75 py-0.75 leading-none">
              {selectedApps?.length}
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
