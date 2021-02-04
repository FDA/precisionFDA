import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Button from '../../Button'
import Modal from '../../Modal'
import TextField from '../../FormComponents/TextField'
import './style.sass'


const suggestedTagsValues = ['QC/Statistics', 'Benchmarking', 'Simulation', 'Reads Pre-processing', 'Read Mapping', 'Variation Calling', 'CNV/SV Calling', 'Annotation', 'Cancer']


const HomeEditTagsModal = ({ isOpen, hideAction, updateAction, isLoading, name, tags, showSuggestedTags }) => {
  const suggestedTagsMap = new Map()
  suggestedTagsValues.forEach((e) => suggestedTagsMap.set(e, false))

  let inputTagsArray = []
  if (showSuggestedTags) {
    tags.forEach((tag) => {
      if (suggestedTagsMap.has(tag)) {
        suggestedTagsMap.set(tag, true)
      } else {
        inputTagsArray.push(tag)
      }
    })
  } else {
    inputTagsArray = tags
  }

  const [suggestedTags, setSuggestedTags] = useState(suggestedTagsMap)
  const [inputTags, setInputTags] = useState(inputTagsArray && inputTagsArray.join(', '))

  const suggestedTagsList = []
  suggestedTags.forEach((value, key) => {
    suggestedTagsList.push(
      <div className='home-edit-tags-modal__suggested-tag' key={key}>
        <label>
          <input
            type='checkbox'
            name={key}
            checked={value}
            onChange={(e) => setSuggestedTags(new Map(suggestedTags.set(key, e.target.checked)))}
          />&nbsp;
          {key}
        </label>
      </div>,
    )
  })

  const updateTagsClick = () => {
    const checkedSuggestedTags = []
    suggestedTags.forEach((value, key) => {
      if (value) checkedSuggestedTags.push(key)
    })
    return updateAction(inputTags, checkedSuggestedTags)
  }

  return (
    <div className='home-edit-tags-modal'>
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={<>Edit tags for <i>{name}</i></>}
        modalFooterContent={
          <>
            <Button onClick={hideAction}>Cancel</Button>
            <Button onClick={updateTagsClick} type='primary'>Update tags</Button>
          </>
        }
        hideModalHandler={hideAction}
        subTitle='Tags are public to the community'
      >
        <div>
          <TextField
            label='Tags (comma-separated)'
            placeholder='e.g. foo, bar...'
            value={inputTags}
            name='tags'
            onChange={(e) => setInputTags(e.target.value)}
          />
          {showSuggestedTags && 
            <div>
              <div className='home-edit-tags-modal__label'>Suggested tags</div>
              {suggestedTagsList}
            </div>
          }
        </div>
      </Modal>
    </div>
  )
}

HomeEditTagsModal.propTypes = {
  hideAction: PropTypes.func,
  updateAction: PropTypes.func,
  name: PropTypes.string,
  tags: PropTypes.array,
  showSuggestedTags: PropTypes.bool,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
}

HomeEditTagsModal.defaultProps = {
  name: '',
}

export default HomeEditTagsModal

export {
  HomeEditTagsModal,
}
