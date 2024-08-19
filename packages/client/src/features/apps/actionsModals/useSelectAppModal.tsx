import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Checkbox } from '../../../components/Checkbox'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { StyledName } from '../../../components/ResourceTable'
import { useDebounce } from '../../../components/Table/useDebounce'
import { Tabs } from '../../../components/Tabs/Tabs'
import { FileIcon } from '../../../components/icons/FileIcon'
import { useAuthUser } from '../../auth/useAuthUser'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import {
  ButtonBadge,
  SelectableTable,
  StyledCell,
  StyledContainer,
  StyledFilterSection,
  StyledOnlyMine,
  StyledRow,
  StyledSubtitle,
  Tab,
} from '../../actionModals/styles'
import { DialogType } from '../../home/types'
import { fetchFilteredApps } from '../apps.api'
import { IApp } from '../apps.types'
import { Button } from '../../../components/Button'

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
  <StyledRow
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
    <StyledCell>
      <StyledName>
        {type === 'radio' && !viewOnly && (
          <StyledContainer>
            <Radio checked={checked} onChange={() => {}} />
          </StyledContainer>
        )}
        {type === 'checkbox' && !viewOnly && (
          <StyledContainer>
            <Checkbox onChange={() => {}} checked={checked} />
          </StyledContainer>
        )}
        <FileIcon />
        {app.title}
      </StyledName>
    </StyledCell>
  </StyledRow>
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
  scopes?: string[],
) => {
  const user = useAuthUser()
  const listedApps: IApp[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedApps, setSelectedApps] = useState(listedApps)
  const [filter, setFilter] = useState('')
  const [showOnlyMyApps, setShowOnlyMyApps] = useState(false)
  const searchText = useDebounce(filter, 250)

  const { data: appsData, isLoading: isLoadingApps, status: loadingAppsStatus } = useQuery({
    queryKey: ['list_apps', searchText],
    queryFn: () => fetchFilteredApps(searchText, scopes ?? ([] as any)), // scopes: [] mean all scopes.
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
  }

  const isMyApp = (app: IApp): boolean => app.user.dxuser === user?.dxuser

  const apps = appsData ?? []

  const modalComp = (
    <ModalNext
      isShown={isShown}
      data-testid="select-app-modal"
      id="select-app-modal"
      headerText={title}
      hide={() => setShowModal(false)}
      variant='medium'
    >
      <ModalHeaderTop headerText={title} hide={() => setShowModal(false)} />
      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <Tabs>
        <Tab title={`Selected ${selectedApps.length}`} key="selected">
          {selectedApps.length === 0 && <StyledRow>No selected apps</StyledRow>}
          {selectedApps.length > 0 && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
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
                </tbody>
              </SelectableTable>
            </ModalScroll>
          )}
        </Tab>
        <Tab title={`Apps ${apps.length}`} key="files">
          <StyledFilterSection>
            <InputText
              placeholder="Filter..."
              onChange={evt => setFilter(evt.target.value)}
            />
            <StyledOnlyMine>
              <input
                type="checkbox"
                onClick={evt => toggleOnlyMine(evt.target.checked)}
              />
              Only mine
            </StyledOnlyMine>
          </StyledFilterSection>
          {isLoadingApps && <Loader />}
          {loadingAppsStatus === 'success' && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
                  {apps
                    .filter((asset: IApp) =>
                      showOnlyMyApps ? isMyApp(asset) && showOnlyMyApps : true,
                    )
                    .map((app: IApp) => (
                      <Row
                        app={app}
                        type={type}
                        viewOnly={false}
                        key={app.id}
                        radioCallback={radioCallback}
                        checkboxCallback={checkboxCallback}
                        checked={selectedApps.some(
                          selected => app.id === selected.id,
                        )}
                      />
                    ))}
                </tbody>
              </SelectableTable>
            </ModalScroll>
          )}
        </Tab>
      </Tabs>
      <Footer>
        <ButtonRow>
          <Button
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            onClick={handleSubmit}
            disabled={selectedApps?.length === 0}
          >
            Select &nbsp;<ButtonBadge>{selectedApps?.length}</ButtonBadge>
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    showModalResetState,
    isShown,
  }
}
