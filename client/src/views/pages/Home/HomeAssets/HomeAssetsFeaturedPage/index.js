import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import { homeAssetsFeaturedListSelector } from '../../../../../reducers/home/assets/selectors'
import {
  fetchAssetsFeatured,
  resetAssetsFeaturedFiltersValue,
  setAssetFeaturedFilterValue,
  assetsAttachTo,
  renameAsset,
  deleteObjects,
  makeFeatured,
  assetsAttachLicence,
  assetsLicenseAction,
} from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeAssetsFeaturedTable from '../../../../components/Home/Assets/HomeAssetsFeaturedTable'
import ActionsDropdown from '../../../../components/Home/Assets/ActionsDropdown'
import { OBJECT_TYPES } from '../../../../../constants'


const HomeAssetsFeaturedPage = (props) => {
  const { assets = [], fetchAssets, resetAssetsFiltersValue, setAssetFilterValue, attachTo, rename, deleteAsset, makeFeatured, attachLicense, assetsLicenseAction } = props

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
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            assets={checkedAssets}
            attachTo={attachTo}
            rename={rename}
            deleteAsset={deleteAsset}
            makeFeatured={makeFeatured}
            attachLicense={attachLicense}
            page='featured'
            assetsLicenseAction={assetsLicenseAction}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAssetsFeaturedTable assets={assets} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeAssetsFeaturedPage.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  fetchAssets: PropTypes.func,
  resetAssetsFiltersValue: PropTypes.func,
  setAssetFilterValue: PropTypes.func,
  attachTo: PropTypes.func,
  rename: PropTypes.func,
  deleteAsset: PropTypes.func,
  makeFeatured: PropTypes.func,
  attachLicense: PropTypes.func,
  assetsLicenseAction: PropTypes.func,
}

const mapStateToProps = (state) => ({
  assets: homeAssetsFeaturedListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAssets: () => dispatch(fetchAssetsFeatured()),
  resetAssetsFiltersValue: () => dispatch(resetAssetsFeaturedFiltersValue()),
  setAssetFilterValue: (value) => dispatch(setAssetFeaturedFilterValue(value)),
  attachTo: (items, noteUids) => dispatch(assetsAttachTo(items, noteUids)),
  rename: (link, name, uid) => dispatch(renameAsset(link, name, uid)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetsFeatured())
  }),
  deleteAsset: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.ASSET, uids)).then(({ status }) => {
    if (status === 200) dispatch(fetchAssetsFeatured())
  }),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.ASSET, uids, featured)).then(({ status }) => {
    if (status === 200) dispatch(fetchAssetsFeatured())
  }),
  attachLicense: (link, scope, ids) => dispatch(assetsAttachLicence(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetsFeatured())
  }),
  assetsLicenseAction: (link) => dispatch(assetsLicenseAction(link)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetsFeatured())
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAssetsFeaturedPage)

export {
  HomeAssetsFeaturedPage,
}
