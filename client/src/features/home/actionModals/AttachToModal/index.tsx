/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { TransparentButton } from '../../../../components/Dropdown/styles'
import { InputText } from '../../../../components/InputText'
import { Loader } from '../../../../components/Loader'
import Icon from '../../../../views/components/Icon'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { ButtonRow, Footer } from '../../../modal/styles'
import { ATTACHABLE_TYPES } from '../useAttachToModal'
import {
  LeftBar,
  NoteContainer,
  NotesMarkdown,
  SearchInput,
  StyledAttachToModal,
} from './styles'
import { useAttachToMutation } from './useAttachToMutation'
import { useListNotesQuery } from './useListNotesQuery'

export const AttachToModal = ({
  isShown,
  hideAction,
  ids,
  itemsType,
}: {
  isShown: boolean
  hideAction: () => void
  ids: string[] | number[]
  itemsType: ATTACHABLE_TYPES
}) => {
  const { data: notesData, isLoading } = useListNotesQuery()
  const mutation = useAttachToMutation()
  const items = notesData || []
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>({})
  const [checkedItemIds, setCheckedItemIds] = useState(new Set<string>())

  useEffect(() => {
    if (items.length) setSelectedItem(items[0])
  }, [items])

  const onCheckboxClick = (uid: string) => {
    if (checkedItemIds.has(uid)) {
      const newSet = checkedItemIds
      newSet.delete(uid)
      setCheckedItemIds(new Set(newSet))
    } else {
      setCheckedItemIds(new Set(checkedItemIds.add(uid)))
    }
  }

  const onClickAttachAction = () => {
    const types = {
      [ATTACHABLE_TYPES.FILE]: 'UserFile',
      [ATTACHABLE_TYPES.APP]: 'App',
      [ATTACHABLE_TYPES.JOB]: 'Job',
      [ATTACHABLE_TYPES.ASSET]: 'Asset',
      [ATTACHABLE_TYPES.WORKFLOW]: 'Workflow',
    } as any

    const it = ids.map((id: string|number) => {
      return {
        id,
        type: types[itemsType],
      }
    })

    mutation.mutateAsync({ items: it, noteUids: [...checkedItemIds]})
  }

  const reg = new RegExp(search, 'i')
  const filteredItems = search
    ? items.filter((e: any) => reg.test(e.title))
    : items

  if (isLoading) return <Loader />

  const itemsList = filteredItems.map(note => {
    const classes = classNames(
      {
        '__menu-item--selected': note.uid === selectedItem.uid,
      },
      '__menu-item',
    )

    return (
      <li
        key={note.uid}
        className={classes}
        onClick={() => setSelectedItem(note)}
        onKeyPress={() => setSelectedItem(note)}
      >
        <div>
          <span
            className="__menu-item_label-wrapper"
            onClick={() => onCheckboxClick(note.uid)}
          >
            <input
              type="checkbox"
              name={note.uid}
              checked={checkedItemIds.has(note.uid)}
              onChange={() => {}}
            />
            <span className="__menu-item_class-label">{note.className}</span>
            <span className="__menu-item_title">{note.title}</span>
          </span>
        </div>
        <span className="__menu-item_chevron">
          <Icon icon="fa-chevron-right" />
        </span>
      </li>
    )
  })

  return (
    <ModalNext
      headerText="Attach note to:"
      hide={hideAction}
      isShown={isShown}
      disableClose={false}
      data-testid="modal-attachto"
    >
      <ModalHeaderTop
        disableClose={false}
        headerText="Attach note to:"
        hide={hideAction}
      />
      <StyledAttachToModal >
        <LeftBar>
          <SearchInput>
            <InputText
              name="search"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="__menu-item_search-icons">
              {search ? (
                <Icon icon="fa-times" onClick={() => setSearch('')} />
              ) : (
                <Icon icon="fa-search" />
              )}
            </span>
          </SearchInput>
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
        </LeftBar>
        <NoteContainer>
          <div className="_title">
            <a data-turbolinks="false" href={selectedItem.path}>
              {selectedItem.title}
            </a>
          </div>
          <NotesMarkdown data={selectedItem.content} />
          <div className="_no-content">
            {!selectedItem.content && 'No content written for this item'}
          </div>
        </NoteContainer>
      </StyledAttachToModal>
      <Footer>
        <ButtonRow>
          <Button onClick={hideAction}>Cancel</Button>
          <ButtonSolidBlue
            onClick={() => onClickAttachAction()}
            disabled={!checkedItemIds.size}
          >
            Attach
          </ButtonSolidBlue>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
}
