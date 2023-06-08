/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { Button, ButtonSolidBlue, TransparentButton } from '../../../../components/Button'
import { CrossIcon } from '../../../../components/icons/PlusIcon'
import { SearchIcon } from '../../../../components/icons/SearchIcon'
import { InputText } from '../../../../components/InputText'
import { Loader } from '../../../../components/Loader'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../../modal/styles'
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

const types = {
  FILE: 'UserFile',
  APP: 'App',
  JOB: 'Job',
  ASSET: 'Asset',
  WORKFLOW: 'Workflow',
} as Record<ATTACHABLE_TYPES, string>

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

  const onClickAttachAction = async () => {
    const it = ids.map((id: string | number) => {
      return {
        id,
        type: types[itemsType],
      }
    })

    await mutation.mutateAsync({ items: it, noteUids: [...checkedItemIds]})
    setSelectedItem({})
    setCheckedItemIds(new Set())
    hideAction()
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
      </li>
    )
  })

  return (
    <ModalNext
      hide={hideAction}
      isShown={isShown}
      disableClose={false}
      data-testid="modal-attachto"
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Attach note to ${types[itemsType]}:`}
        hide={hideAction}
      />
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
                <TransparentButton onClick={() => setSearch('')}><CrossIcon height={16} /></TransparentButton>
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
            <div className="_title">
              <a data-turbolinks="false" href={selectedItem.path}>
                {selectedItem.title}
              </a>
            </div>
            <NotesMarkdown data={selectedItem.content} />
            <div className="_no-content">
              {!selectedItem.content && 'No content written for this item'}
            </div>
          </ModalScroll>
        </NoteContainer>
      </StyledAttachToModal>
      <Footer>
        <ButtonRow>
          {mutation.isLoading && <Loader />}
          <Button onClick={hideAction}>Cancel</Button>
          <ButtonSolidBlue
            onClick={() => onClickAttachAction()}
            disabled={!checkedItemIds.size || mutation.isLoading}
          >
            Attach
          </ButtonSolidBlue>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
}
