import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { TransparentButton, Button } from '../../components/Button'
import { InputText } from '../../components/InputText'
import { Loader } from '../../components/Loader'
import { CrossIcon } from '../../components/icons/PlusIcon'
import { SearchIcon } from '../../components/icons/SearchIcon'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, HeaderText, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { LeftBar, ModalLoader, NoteContainer, NotesMarkdown, SearchInput, StyledAttachToModal } from './AttachToModal/styles'
import { Asset, useListAssetsQuery } from './AttachToModal/useListAssetsQuery'

const AssetHeaderText = () => (
  <>
    <HeaderText>Selected Assets for your VM Environment</HeaderText>
    <span>Manage your assets</span>
  </>
)

export const AssetAttachModal = ({ hideAction, isShown, values, onChange }) => {
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

  console.log('checkedItem', checkedItem)
  console.log('values', values)
  console.log('items', items)
  console.log('items[0]', items[0])
  console.log('???', checkedItem.has(items[0]))

  const reg = new RegExp(search, 'i')
  const filteredItems = search ? items.filter(e => reg.test(e.title)) : items

  const itemsList = filteredItems.map(item => {
    const classes = classNames('__menu-item', {
      '__menu-item--selected': item.uid === selectedItem?.uid,
    })

    return (
      <li key={item.uid} className={classes} onClick={() => setSelectedItem(item)}>
        <div>
          <span className="__menu-item_label-wrapper" onClick={() => onCheckboxClick(item)}>
            <input type="checkbox" name={item.uid} checked={checkedItem.has(item.uid)} readOnly />
            <span className="__menu-item_class-label">{item.className}</span>
            <span className="__menu-item_title">{item.title}</span>
          </span>
        </div>
      </li>
    )
  })

  return (
    <ModalNext hide={hideAction} isShown={isShown} id="modal-attachto-asset">
      <ModalHeaderTop headerText={<AssetHeaderText />} hide={hideAction} />
      {isLoading ? (
        <ModalLoader>
          <Loader />
        </ModalLoader>
      ) : (
        <>
          <StyledAttachToModal>
            <LeftBar>
              <SearchInput>
                <InputText name="search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <ul className="__items-list">
                  {itemsList}
                  {!itemsList.length && (
                    <div className="__menu-item">
                      <span className="text-muted _no-content">No results found</span>
                      <TransparentButton className="__menu-item_clear" onClick={() => setSearch('')}>
                        Clear query
                      </TransparentButton>
                    </div>
                  )}
                </ul>
              </ModalScroll>
            </LeftBar>
            <NoteContainer>
              <ModalScroll>
                {selectedItem && (
                  <>
                    <div className="_title">
                      <a href={selectedItem.path}>{selectedItem.title}</a>
                    </div>
                    <NotesMarkdown data={selectedItem?.content} />
                    <div className="_no-content">{!selectedItem?.content && 'No content written for this item'}</div>
                  </>
                )}
              </ModalScroll>
            </NoteContainer>
          </StyledAttachToModal>
          <Footer>
            <ButtonRow>
              <Button onClick={hideAction}>Cancel</Button>
              <Button data-variant="primary" onClick={onClickAttachAction}>
                Confirm
              </Button>
            </ButtonRow>
          </Footer>
        </>
      )}
    </ModalNext>
  )
}

export function useAssetAttachModal(value: Asset[], onChange: (a: Asset[]) => void) {
  const { isShown, setShowModal } = useModal()
  const modalComp = (
    <AssetAttachModal onChange={onChange} isShown={isShown} hideAction={() => setShowModal(false)} values={value} />
  )
  return { modalComp, setShowModal, isShown }
}
