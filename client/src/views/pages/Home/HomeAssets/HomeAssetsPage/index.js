import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import { homeAssetsListSelector } from '../../../../../reducers/home/assets/selectors'
import {
  fetchAssets,
  resetAssetsFiltersValue,
  setAssetFilterValue,
  assetsAttachTo,
  renameAsset,
  deleteObjects,
  assetsAttachLicence,
  assetsLicenseAction,
} from '../../../../../actions/home'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAssetsTable from '../../../../components/Home/Assets/HomeAssetsTable'
import LinkTargetBlank from '../../../../components/LinkTargetBlank'
import ActionsDropdown from '../../../../components/Home/Assets/ActionsDropdown'
import { OBJECT_TYPES } from '../../../../../constants'


const HomeAssetsPage = (props) => {
  const { assets = [], fetchAssets, resetAssetsFiltersValue, setAssetFilterValue, attachTo, rename, deleteAsset, attachLicense, assetsLicenseAction } = props

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
            assets={checkedAssets}
            attachTo={attachTo}
            rename={rename}
            deleteAsset={deleteAsset}
            attachLicense={attachLicense}
            assetsLicenseAction={assetsLicenseAction}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAssetsTable assets={assets} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeAssetsPage.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  fetchAssets: PropTypes.func,
  resetAssetsFiltersValue: PropTypes.func,
  setAssetFilterValue: PropTypes.func,
  attachTo: PropTypes.func,
  rename: PropTypes.func,
  deleteAsset: PropTypes.func,
  attachLicense: PropTypes.func,
  assetsLicenseAction: PropTypes.func,
}

const mapStateToProps = (state) => ({
  assets: homeAssetsListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAssets: () => dispatch(fetchAssets()),
  resetAssetsFiltersValue: () => dispatch(resetAssetsFiltersValue()),
  setAssetFilterValue: (value) => dispatch(setAssetFilterValue(value)),
  attachTo: (items, noteUids) => dispatch(assetsAttachTo(items, noteUids)),
  rename: (link, name, uid) => dispatch(renameAsset(link, name, uid)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssets())
  }),
  deleteAsset: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.ASSET, uids)).then(({ status }) => {
    if (status === 200) dispatch(fetchAssets())
  }),
  attachLicense: (link, scope, ids) => dispatch(assetsAttachLicence(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssets())
  }),
  assetsLicenseAction: (link) => dispatch(assetsLicenseAction(link)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssets())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAssetsPage)

export {
  HomeAssetsPage,
}
