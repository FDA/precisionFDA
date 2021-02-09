import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import { homeAssetsEverybodyListSelector } from '../../../../../reducers/home/assets/selectors'
import {
  fetchAssetsEverybody,
  resetAssetsEverybodyFiltersValue,
  setAssetEverybodyFilterValue,
  makeFeatured,
  assetsAttachTo,
  renameAsset,
  deleteObjects,
  assetsAttachLicence,
  assetsLicenseAction,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAssetsEverybodyTable from '../../../../components/Home/Assets/HomeAssetsEverybodyTable'
import LinkTargetBlank from '../../../../components/LinkTargetBlank'
import ActionsDropdown from '../../../../components/Home/Assets/ActionsDropdown'


const HomeAssetsEverybodyPage = (props) => {
  const { assets = [], fetchAssets, resetAssetsFiltersValue, setAssetFilterValue, makeFeatured, attachTo, rename, deleteAsset, attachLicense, assetsLicenseAction } = props

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
            page='public'
            assets={checkedAssets}
            attachTo={attachTo}
            makeFeatured={makeFeatured}
            rename={rename}
            deleteAsset={deleteAsset}
            attachLicense={attachLicense}
            assetsLicenseAction={assetsLicenseAction}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAssetsEverybodyTable assets={assets} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeAssetsEverybodyPage.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  fetchAssets: PropTypes.func,
  resetAssetsFiltersValue: PropTypes.func,
  setAssetFilterValue: PropTypes.func,
  makeFeatured: PropTypes.func,
  attachTo: PropTypes.func,
  rename: PropTypes.func,
  deleteAsset: PropTypes.func,
  attachLicense: PropTypes.func,
  assetsLicenseAction: PropTypes.func,
}

const mapStateToProps = (state) => ({
  assets: homeAssetsEverybodyListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAssets: () => dispatch(fetchAssetsEverybody()),
  resetAssetsFiltersValue: () => dispatch(resetAssetsEverybodyFiltersValue()),
  setAssetFilterValue: (value) => dispatch(setAssetEverybodyFilterValue(value)),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.ASSET, uids, featured)),
  attachTo: (items, noteUids) => dispatch(assetsAttachTo(items, noteUids)),
  rename: (link, name, uid) => dispatch(renameAsset(link, name, uid)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetsEverybody())
  }),
  deleteAsset: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.ASSET, uids)).then(({ status }) => {
    if (status === 200) dispatch(fetchAssetsEverybody())
  }),
  attachLicense: (link, scope, ids) => dispatch(assetsAttachLicence(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetsEverybody())
  }),
  assetsLicenseAction: (link) => dispatch(assetsLicenseAction(link)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetsEverybody())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAssetsEverybodyPage)

export {
  HomeAssetsEverybodyPage,
}
