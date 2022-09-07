import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { fetchAttachingItems } from '../../../../actions/home'
import { homeAttachingItemsSelector } from '../../../../reducers/home/page/selectors'
import { OBJECT_TYPES } from '../../../../constants'
import { Markdown } from '../../../../components/Markdown'
import { ButtonSolidBlue, Button } from '../../../../components/Button'
import Icon from '../../../../views/components/Icon'
import Modal from '../../../../views/components/Modal'
import Input from '../../../../views/components/FormComponents/Input'
import { StyledAttachToModal } from './styles'


const Footer = ({ hideAction, attachAction, isCopyDisabled }: { hideAction: () => void, attachAction: () => void,  isCopyDisabled: boolean}) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <ButtonSolidBlue onClick={attachAction} disabled={isCopyDisabled}>Attach</ButtonSolidBlue>
  </>
)

const HomeAttachToModal = (props: any) => {
  const { isOpen, hideAction, title, attachAction, isLoading, ids, itemsType, attachingItems, fetchAttachingItems } = props

  const { items = []} = attachingItems

  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>({})
  const [checkedItemIds, setCheckedItemIds] = useState(new Set())

  useEffect(() => {
    if (isOpen) {
      setSelectedItem({})
      setCheckedItemIds(new Set())
      setSearch('')
      fetchAttachingItems()
    }
  }, [isOpen])

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
      [OBJECT_TYPES.FILE]: 'UserFile',
      [OBJECT_TYPES.APP]: 'App',
      [OBJECT_TYPES.JOB]: 'Job',
      [OBJECT_TYPES.ASSET]: 'Asset',
      [OBJECT_TYPES.WORKFLOW]: 'Workflow',
    }

    const items = ids.map((id: string) => {
      return {
        id,
        type: types[itemsType],
      }
    })

    attachAction(items, [...checkedItemIds])
  }

  const reg = new RegExp(search, 'i')
  const filteredItems = search ? items.filter((e: any) => reg.test(e.title)) : items

  const itemsList = filteredItems.map((note: any) => {
    const classes = classNames({
      '__menu-item--selected': note.uid === selectedItem.uid,
    }, '__menu-item')

    return (
      <li key={note.uid} className={classes} onClick={() => setSelectedItem(note)}>
        <div>
          <span className='__menu-item_label-wrapper' onClick={() => onCheckboxClick(note.uid)} >
            <input
              type='checkbox'
              name={note.uid}
              checked={checkedItemIds.has(note.uid)}
              onChange={() => { }}
            />
            <span className='__menu-item_class-label'>{note.className}</span>
            <span className='__menu-item_title'>{note.title}</span>
          </span>
        </div>
        <span className='__menu-item_chevron'>
          <Icon icon='fa-chevron-right' />
        </span>
      </li>
    )
  })

  return (
    <Modal
      className='resource_type__modal'
      isOpen={isOpen}
      isLoading={isLoading || attachingItems.isLoading}
      title={title}
      modalFooterContent={
        <Footer
          hideAction={hideAction}
          isCopyDisabled={!checkedItemIds.size}
          attachAction={onClickAttachAction}
        />}
      hideModalHandler={hideAction}
      noPadding
    >
      <StyledAttachToModal data-testid="modal-attachto">
        <div className='__menu-container'>
          <div className='__menu-item'>
            <Input
              name='search'
              placeholder='Search...'
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
            />
            <span className='__menu-item_search-icons'>
              {search ?
                <Icon icon='fa-times' onClick={() => setSearch('')} /> :
                <Icon icon='fa-search' />
              }
            </span>
          </div>
          <div>
            <ul className='__items-list'>
              {itemsList}
              {!itemsList.length &&
                <div className='__menu-item'>
                  <span className='text-muted noResultContent'>No results found</span>
                  <span className='__menu-item_clear removeQuery' onClick={() => setSearch('')} >Clear query</span>
                </div>
              }
            </ul>
          </div>
        </div>
        <div className='__note-container'>
          <div className='__note-container_title'>
            <a href={selectedItem.path} >{selectedItem.title}</a>
          </div>
          <Markdown data={selectedItem.content} />
          <div className='__note-container_no-content noResultContent'>
            {!selectedItem.content && 'No content written for this item'}
          </div>
        </div>
      </StyledAttachToModal>
    </Modal>
  )
}

HomeAttachToModal.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.number),
  attachAction: PropTypes.func,
  title: PropTypes.string,
  isLoading: PropTypes.bool,
  isOpen: PropTypes.bool,
  hideAction: PropTypes.func,
  itemsType: PropTypes.string,
  attachingItems: PropTypes.object,
  fetchAttachingItems: PropTypes.func,
}

HomeAttachToModal.defaultProps = {
  ids: [],
  attachAction: () => { },
  title: 'Select a note or answer to attach to',
  hideAction: () => { },
  attachingItems: {},
}

Footer.propTypes = {
  hideAction: PropTypes.func,
  attachAction: PropTypes.func,
  isCopyDisabled: PropTypes.bool,
}

const mapStateToProps = (state: any) => ({
  attachingItems: homeAttachingItemsSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  fetchAttachingItems: () => dispatch(fetchAttachingItems()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAttachToModal)

export {
  HomeAttachToModal,
}
