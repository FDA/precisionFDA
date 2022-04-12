import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import Button from '../../Button'
import Modal from '../../Modal'
import Icon from '../../Icon'
import Input from '../../FormComponents/Input'
import { fetchAttachingItems } from '../../../../actions/home'
import { homeAttachingItemsSelector } from '../../../../reducers/home/page/selectors'
import { OBJECT_TYPES } from '../../../../constants'
import './style.sass'
import { Markdown } from '../../../../components/Markdown'


const Footer = ({ hideAction, attachAction, isCopyDisabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" onClick={attachAction} disabled={isCopyDisabled}>Attach</Button>
  </>
)

const HomeAttachToModal = (props) => {
  const { isOpen, hideAction, title, attachAction, isLoading, ids, itemsType, attachingItems, fetchAttachingItems } = props

  const { items = []} = attachingItems

  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState({})
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

  const onCheckboxClick = (uid) => {
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
      [OBJECT_TYPES.ASSET]: 'Asset',
      [OBJECT_TYPES.FILE]: 'UserFile',
      [OBJECT_TYPES.APP]: 'App',
      [OBJECT_TYPES.JOB]: 'Job',
      [OBJECT_TYPES.ASSET]: 'Asset',
      [OBJECT_TYPES.WORKFLOW]: 'Workflow',
    }

    const items = ids.map((id) => {
      return {
        id,
        type: types[itemsType],
      }
    })

    attachAction(items, [...checkedItemIds])
  }

  const reg = new RegExp(search, 'i')
  const filteredItems = search ? items.filter(e => reg.test(e.title)) : items

  const itemsList = filteredItems.map((note) => {
    const classes = classNames({
      'home-attach-to-modal__menu-item--selected': note.uid === selectedItem.uid,
    }, 'home-attach-to-modal__menu-item')

    return (
      <li key={note.uid} className={classes} onClick={() => setSelectedItem(note)}>
        <div>
          <span className='home-attach-to-modal__menu-item_label-wrapper' onClick={() => onCheckboxClick(note.uid)} >
            <input
              type='checkbox'
              name={note.uid}
              checked={checkedItemIds.has(note.uid)}
              onChange={() => { }}
            />
            <span className='home-attach-to-modal__menu-item_class-label'>{note.className}</span>
            <span className='home-attach-to-modal__menu-item_title'>{note.title}</span>
          </span>
        </div>
        <span className='home-attach-to-modal__menu-item_chevron'>
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
      <div data-testid="modal-attachto" className='home-attach-to-modal'>
        <div className='home-attach-to-modal__menu-container'>
          <div className='home-attach-to-modal__menu-item'>
            <Input
              name='search'
              placeholder='Search...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className='home-attach-to-modal__menu-item_search-icons'>
              {search ?
                <Icon icon='fa-times' onClick={() => setSearch('')} /> :
                <Icon icon='fa-search' />
              }
            </span>
          </div>
          <div>
            <ul className='home-attach-to-modal__items-list'>
              {itemsList}
              {!itemsList.length &&
                <div className='home-attach-to-modal__menu-item'>
                  <span className='text-muted'>No results found</span>
                  <span className='home-attach-to-modal__menu-item_clear' onClick={() => setSearch('')} >Clear query</span>
                </div>
              }
            </ul>
          </div>
        </div>
        <div className='home-attach-to-modal__note-container'>
          <div className='home-attach-to-modal__note-container_title'>
            <a href={selectedItem.path} >{selectedItem.title}</a>
          </div>
          <Markdown data={selectedItem.content} />
          <div className='home-attach-to-modal__note-container_no-content'>
            {!selectedItem.content && 'No content written for this item'}
          </div>
        </div>
      </div>
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

const mapStateToProps = (state) => ({
  attachingItems: homeAttachingItemsSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAttachingItems: () => dispatch(fetchAttachingItems()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAttachToModal)

export {
  HomeAttachToModal,
}
