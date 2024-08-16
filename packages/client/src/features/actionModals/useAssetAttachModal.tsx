import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import {
  TransparentButton, Button,
} from '../../components/Button'
import { InputText } from '../../components/InputText'
import { Loader } from '../../components/Loader'
import { CrossIcon } from '../../components/icons/PlusIcon'
import { SearchIcon } from '../../components/icons/SearchIcon'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, HeaderText, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import {
  LeftBar,
  ModalLoader,
  NoteContainer,
  NotesMarkdown,
  SearchInput,
  StyledAttachToModal,
} from './AttachToModal/styles'
import { Asset, useListAssetsQuery } from './AttachToModal/useListAssetsQuery'

export type ATTACHABLE_TYPES =
  | 'FILE'
  | 'APP'
  | 'DATABASE'
  | 'WORKFLOW'
  | 'JOB'
  | 'ASSET'

const AssetHeaderText = () => {
  return (
    <>
      <HeaderText>Selected Assets for your VM Environment</HeaderText>{' '}
      <span>Manage your assets</span>
    </>
  )
}

export const AssetAttachModal = ({
  hideAction,
  isShown,
  values,
  onChange,
}: any) => {
  const { data: notesData, isLoading } = useListAssetsQuery()
  const items = notesData || []
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<Asset>()
  const [checkedItem, setCheckedItem] = useState(new Set<Asset>(values))

  useEffect(() => {
    if (items.length) setSelectedItem(items[0])
  }, [items])

  const onCheckboxClick = (item: Asset) => {
    if (checkedItem.has(item)) {
      const newSet = checkedItem
      newSet.delete(item)
      setCheckedItem(new Set(newSet))
    } else {
      setCheckedItem(new Set(checkedItem.add(item)))
    }
  }

  const onClickAttachAction = async () => {
    if (onChange) onChange(Array.from(checkedItem))
    hideAction()
  }

  const reg = new RegExp(search, 'i')
  const filteredItems = search
    ? items.filter((e: any) => reg.test(e.title))
    : items

  const itemsList = filteredItems.map(item => {
    const classes = classNames(
      {
        '__menu-item--selected': item.uid === selectedItem?.uid,
      },
      '__menu-item',
    )

    return (
      <li
        key={item.uid}
        className={classes}
        onClick={() => setSelectedItem(item)}
        onKeyPress={() => setSelectedItem(item)}
      >
        <div>
          <span
            className="__menu-item_label-wrapper"
            onClick={() => onCheckboxClick(item)}
          >
            <input
              type="checkbox"
              name={item.uid}
              checked={checkedItem.has(item)}
              onChange={() => {}}
            />
            <span className="__menu-item_class-label">{item.className}</span>
            <span className="__menu-item_title">{item.title}</span>
          </span>
        </div>
      </li>
    )
  })

  return (
    <ModalNext
      hide={hideAction}
      isShown={isShown}
      disableClose={false}
      data-testid="modal-attachto-asset"
      id="modal-attachto-asset"
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={<AssetHeaderText />}
        hide={hideAction}
      />
      {isLoading ? (
        <ModalLoader>
          <Loader />
        </ModalLoader>
      ) : (
        <>
          <StyledAttachToModal>
            <LeftBar>
              <SearchInput>
                <InputText
                  name="search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e: any) => setSearch(e.target.value)}
                />
                <span className="__menu-item_search-icons">
                  {search ? (
                    <TransparentButton onClick={() => setSearch('')}>
                      <CrossIcon height={16} />
                    </TransparentButton>
                  ) : (
                    <SearchIcon height={16} />
                  )}
                </span>
              </SearchInput>
              <ModalScroll>
                <div>
                  <ul className="__items-list">
                    {itemsList}
                    {!itemsList.length && (
                      <div className="__menu-item">
                        <span className="text-muted _no-content">
                          No results found
                        </span>
                        <TransparentButton
                          className="__menu-item_clear"
                          onClick={() => setSearch('')}
                        >
                          Clear query
                        </TransparentButton>
                      </div>
                    )}
                  </ul>
                </div>
              </ModalScroll>
            </LeftBar>
            <NoteContainer>
              <ModalScroll>
                {selectedItem && (
                  <>
                    <div className="_title">
                      <a data-turbolinks="false" href={selectedItem.path}>
                        {selectedItem.title}
                      </a>
                    </div>
                    <NotesMarkdown data={selectedItem?.content} />
                    <div className="_no-content">
                      {!selectedItem?.content &&
                        'No content written for this item'}
                    </div>
                  </>
                )}
              </ModalScroll>
            </NoteContainer>
          </StyledAttachToModal>

          <Footer>
            <ButtonRow>
              <Button onClick={hideAction}>Cancel</Button>
              <Button
                data-variant="primary"
                onClick={() => onClickAttachAction()}
                disabled={!checkedItem.size}
              >
                Attach
              </Button>
            </ButtonRow>
          </Footer>
        </>
      )}
    </ModalNext>
  )
}

export function useAssetAttachModal(
  value: Asset[],
  onChange: (a: any) => void,
) {
  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <AssetAttachModal
      onChange={onChange}
      isShown={isShown}
      hideAction={() => setShowModal(false)}
      value={value}
    />
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
