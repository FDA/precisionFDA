import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

import { debounce } from '../../../../utils'
import Icon from '../../Icon'
import './style.sass'


const SpacesListSearch = ({ filterSpacesHandler }) => {
  const [spacesListSearch, setSpacesListSearch] = useState('')
  const showIcon = !!spacesListSearch.length

  const debFilter = useCallback(debounce((value) => filterSpacesHandler(value), 400), [])

  const onChange = (e) => {
    setSpacesListSearch(e.target.value)
    debFilter(e.target.value)
  }

  const clearSearch = () => {
    setSpacesListSearch('')
    filterSpacesHandler('')
  }

  return (
    <div className="spaces-list-search">
      <div className="spaces-list-search__input">
        <input
          name="spacesListSearch"
          value={spacesListSearch}
          placeholder="Filter by State, Name, Type or User..."
          onChange={onChange}
          type="text"
          autoComplete="off"
          className="form-control"
          aria-label="Search box to filter Spaces by State, Name, Type or User..."
        />
        {(showIcon) && (
          <div className="spaces-list-search__icon">
            <Icon icon="fa-times" onClick={clearSearch} />
          </div>
        )}
      </div>
    </div>
  )
}

SpacesListSearch.propTypes = {
  filterSpacesHandler: PropTypes.func,
}

export default SpacesListSearch
