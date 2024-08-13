import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Checkbox } from '../../../components/Checkbox'
import { InputText } from '../../../components/InputText'
import { Loader } from '../../../components/Loader'
import { Radio } from '../../../components/Radio'
import { StyledName } from '../../../components/ResourceTable'
import { useDebounce } from '../../../components/Table/useDebounce'
import { Tabs } from '../../../components/Tabs/Tabs'
import { ArrowUpRightFromSquareIcon } from '../../../components/icons/ArrowUpRightFromSquareIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { GlobeIcon } from '../../../components/icons/GlobeIcon'
import { useAuthUser } from '../../auth/useAuthUser'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import {
  ButtonBadge,
  SelectableTable,
  StyledAction,
  StyledCell,
  StyledContainer,
  StyledFileDetail,
  StyledFileDetailItem,
  StyledFilterSection,
  StyledOnlyMine,
  StyledRow,
  StyledSubtitle,
  Tab,
} from '../../actionModals/styles'
import { DialogType } from '../../home/types'
import { fetchFilteredAssets } from '../assets.api'
import { IAsset } from '../assets.types'
import { Button } from '../../../components/Button'

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
  <StyledRow
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
        {asset.title}
      </StyledName>

      <StyledFileDetail>
        {asset.public && <GlobeIcon />}

        {asset.private && 'Private'}
        {asset.public && 'Public'}

        <StyledFileDetailItem>{asset.location}</StyledFileDetailItem>
        <StyledFileDetailItem>{asset.user.full_name}</StyledFileDetailItem>
        <StyledFileDetailItem>{asset.org.name}</StyledFileDetailItem>
      </StyledFileDetail>
    </StyledCell>
    <StyledCell>
      <StyledAction href={asset.path}>
        <ArrowUpRightFromSquareIcon />
      </StyledAction>
    </StyledCell>
  </StyledRow>
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
  scopes?: string[],
) => {
  const user = useAuthUser()
  const listedAssets: IAsset[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedAssets, setSelectedAssets] = useState(listedAssets)
  const [filter, setFilter] = useState('')
  const [showOnlyMyAssets, setShowOnlyMyAssets] = useState(false)
  const searchText = useDebounce(filter, 250)

  const { data: assetsData, isLoading: isLoadingAssets, status: loadingAssetsStatus } = useQuery({
    queryKey: ['list_assets', searchText],
    queryFn: () => fetchFilteredAssets(searchText, scopes ?? ([] as any)), // scopes: [] mean all scopes.
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
  }

  const isMyAsset = (asset: IAsset): boolean =>
    asset.user.dxuser === user?.dxuser

  const assets = assetsData ?? []

  const modalComp = (
    <ModalNext
      id="select-asset-modal"
      headerText={title}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText={title} hide={() => setShowModal(false)} />
      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <Tabs>
        <Tab title={`Selected ${selectedAssets.length}`} key="selected">
          {selectedAssets.length === 0 && (
            <StyledRow>No selected assets</StyledRow>
          )}
          {selectedAssets.length > 0 && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
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
                </tbody>
              </SelectableTable>
            </ModalScroll>
          )}
        </Tab>
        <Tab title={`Assets ${assets.length}`} key="files">
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
          {isLoadingAssets && <Loader />}
          {loadingAssetsStatus === 'success' && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
                  {assets
                    .filter((asset: IAsset) =>
                      showOnlyMyAssets
                        ? isMyAsset(asset) && showOnlyMyAssets
                        : true,
                    )
                    .map((asset: IAsset) => (
                      <Row
                        asset={asset}
                        type={type}
                        viewOnly={false}
                        key={asset.id}
                        radioCallback={radioCallback}
                        checkboxCallback={checkboxCallback}
                        checked={selectedAssets.some(
                          selected => asset.id === selected.id,
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
            disabled={selectedAssets?.length === 0}
          >
            Select &nbsp;<ButtonBadge>{selectedAssets?.length}</ButtonBadge>
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
