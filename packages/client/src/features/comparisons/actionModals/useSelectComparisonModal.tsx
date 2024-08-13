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
import { fetchFilteredComparisons } from '../comparisons.api'
import { IComparison } from '../comparisons.types'
import { Button } from '../../../components/Button'

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
  <StyledRow
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
        {comparison.title}
      </StyledName>

      <StyledFileDetail>
        {comparison.public && <GlobeIcon />}

        {comparison.private && 'Private'}
        {comparison.public && 'Public'}

        <StyledFileDetailItem>{comparison.user.full_name}</StyledFileDetailItem>
        <StyledFileDetailItem>{comparison.org.name}</StyledFileDetailItem>
      </StyledFileDetail>
    </StyledCell>
    <StyledCell>
      <StyledAction href={comparison.path}>
        <ArrowUpRightFromSquareIcon />
      </StyledAction>
    </StyledCell>
  </StyledRow>
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
  scopes?: string[],
) => {
  const user = useAuthUser()
  const listedComparisons: IComparison[] = []
  const { isShown, setShowModal } = useModal()
  const [selectedComparisons, setSelectedComparisons] =
    useState(listedComparisons)
  const [filter, setFilter] = useState('')
  const [showOnlyMyComparisons, setShowOnlyMyComparisons] = useState(false)
  const searchText = useDebounce(filter, 250)

  const { data: comparisonsData, isLoading: isLoadingComparisons, status: loadingComparisonsStatus } = useQuery({
    queryKey: ['list_comparisons', searchText],
    queryFn: () => fetchFilteredComparisons(searchText, scopes ?? ([] as any)), // scopes: [] mean all scopes.
    enabled: isShown,
  })

  const radioCallback = (comparison: IComparison) => {
    setSelectedComparisons([comparison])
  }

  const addComparision = (comparison: IComparison) => {
    setSelectedComparisons(prev => [...prev, comparison])
  }

  const removeComparison = (comparison: IComparison) => {
    setSelectedComparisons(prev => [
      ...prev.filter(item => comparison.id !== item.id),
    ])
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

  const isMyComparison = (comparison: IComparison): boolean =>
    comparison.user.dxuser === user?.dxuser

  const comparisons = comparisonsData ?? []

  const modalComp = (
    <ModalNext
      id="select-comparison-modal"
      headerText={title}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText={title} hide={() => setShowModal(false)} />
      {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
      <Tabs>
        <Tab title={`Selected ${selectedComparisons.length}`} key="selected">
          {selectedComparisons.length === 0 && (
            <StyledRow>No selected comparisons</StyledRow>
          )}
          {selectedComparisons.length > 0 && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
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
                </tbody>
              </SelectableTable>
            </ModalScroll>
          )}
        </Tab>
        <Tab title={`Comparisons ${comparisons.length}`} key="files">
          <StyledFilterSection>
            <InputText
              placeholder="Filter..."
              onChange={evt => setFilter(evt.target.value)}
            />
            <StyledOnlyMine>
              <input
                type="checkbox"
                onClick={e => toggleOnlyMine(e.target.checked)}
              />
              Only mine
            </StyledOnlyMine>
          </StyledFilterSection>
          {isLoadingComparisons && <Loader />}
          {loadingComparisonsStatus === 'success' && (
            <ModalScroll>
              <SelectableTable>
                <tbody>
                  {comparisons
                    .filter((comparison: IComparison) =>
                      showOnlyMyComparisons
                        ? isMyComparison(comparison) && showOnlyMyComparisons
                        : true,
                    )
                    .map((comparison: IComparison) => (
                      <Row
                        comparison={comparison}
                        type={type}
                        viewOnly={false}
                        key={comparison.id}
                        radioCallback={radioCallback}
                        checkboxCallback={checkboxCallback}
                        checked={selectedComparisons.some(
                          selected => comparison.id === selected.id,
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
            disabled={selectedComparisons?.length === 0}
          >
            Select &nbsp;
            <ButtonBadge>{selectedComparisons?.length}</ButtonBadge>
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
