import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import { homeAssetsSpacesListSelector } from '../../../../../reducers/home/assets/selectors'
import {
  fetchAssetsSpaces,
  setAssetSpacesFilterValue,
  resetAssetsSpacesFiltersValue,
  assetsAttachTo,
} from '../../../../../actions/home'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAssetsSpacesTable from '../../../../components/Home/Assets/HomeAssetsSpacesTable'
import LinkTargetBlank from '../../../../components/LinkTargetBlank'
import ActionsDropdown from '../../../../components/Home/Assets/ActionsDropdown'


const HomeAssetsSpacesPage = (props) => {
  const { assets = [], fetchAssets, resetAssetsFiltersValue, setAssetFilterValue, attachTo } = props

  useLayoutEffect(() => {
    resetAssetsFiltersValue()
    fetchAssets()
  }, [])

  const handleFilterValue = (value) => {
    setAssetFilterValue(value)
    fetchAssets()
  }

  const checkedAssets = assets.filter(e => e.isChecked)

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions'>
          <LinkTargetBlank url='/assets/new'>
            <Button type='primary'>
              <span>
                <Icon icon='fa-question' />&nbsp;
                How to create assets
              </span>
            </Button>
          </LinkTargetBlank>
        </div>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            page='spaces'
            assets={checkedAssets}
            attachTo={attachTo}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAssetsSpacesTable assets={assets} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeAssetsSpacesPage.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  fetchAssets: PropTypes.func,
  resetAssetsFiltersValue: PropTypes.func,
  setAssetFilterValue: PropTypes.func,
  attachTo: PropTypes.func,
}

const mapStateToProps = (state) => ({
  assets: homeAssetsSpacesListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAssets: () => dispatch(fetchAssetsSpaces()),
  resetAssetsFiltersValue: () => dispatch(resetAssetsSpacesFiltersValue()),
  setAssetFilterValue: (value) => dispatch(setAssetSpacesFilterValue(value)),
  attachTo: (items, noteUids) => dispatch(assetsAttachTo(items, noteUids)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAssetsSpacesPage)

export {
  HomeAssetsSpacesPage,
}
