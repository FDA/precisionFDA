import React, { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import HomeLayout from '../../../../layouts/HomeLayout'
import Icon from '../../../../components/Icon'
import TabsSwitch from '../../../../components/TabsSwitch'
import Loader from '../../../../components/Loader'
import TagsList from '../../../../components/TagsList'
import {
  homeAssetsAssetDetailsSelector,
} from '../../../../../reducers/home/assets/selectors'
import { homeCurrentTabSelector } from '../../../../../reducers/home/page/selectors'
import { HOME_TABS } from '../../../../../constants'
import {
  fetchAssetDetails,
  setCurrentTab,
  editAssetTags,
  assetsAttachTo,
  renameAsset,
  deleteObjects,
  assetsAttachLicence,
  assetsLicenseAction,
} from '../../../../../actions/home'
import { getSelectedTab } from '../../../../../helpers/home'
import { OBJECT_TYPES } from '../../../../../constants'
import Markdown from '../../../../components/Markdown'
import ArchiveContents from '../../../../components/Home/Assets/ArchiveContents'
import ActionsDropdown from '../../../../components/Home/Assets/ActionsDropdown'
import HomeLicense from '../../../../components/Home/HomeLicense'


const HomeAssetSinglePage = (props) => {
  const { assetDetails, currentTab, uid, fetchAssetDetails, setCurrentTab, editTags, attachTo, rename, deleteAsset, attachLicense, assetsLicenseAction } = props

  useLayoutEffect(() => {
    if (uid) fetchAssetDetails(uid).then(({ status, payload }) => {
      if (status) {
        const selectedTab = getSelectedTab(payload.asset.location, payload.asset.links.space)
        setCurrentTab(selectedTab)
      }
    })
  }, [uid])

  const { asset, isFetching, meta } = assetDetails

  if (isFetching) {
    return (
      <HomeLayout hideTabs>
        <div className='text-center'>
          <Loader />
        </div>
      </HomeLayout>
    )
  }

  if (!asset || !asset.id) return <HomeLayout><span>Asset not found</span></HomeLayout>

  const renderAssetOptions = () => {
    const columns = [
      {
        header: 'location',
        value: 'location',
        link: asset.links.space && `${asset.links.space}/apps`,
      },
      {
        header: 'id',
        value: 'uid',
      },
      {
        header: 'added by',
        value: 'addedBy',
        link: asset.links.user,
      },
      {
        header: 'archive name',
        value: 'name',
      },
      {
        header: 'file size',
        value: 'size',
      },
      {
        header: 'created on',
        value: 'createdAtDateTime',
      },
    ]

    const list = columns.map((e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        {
          (e.header === 'location' && !e.link) ?
            <Link to={`/home/assets${tab}`} className='home-single-page__object-options_value'>{asset[e.value]}</Link>
            :
            e.link ?
              <Link to={e.link} target='_blank' className='home-single-page__object-options_value'>{asset[e.value]}</Link> :
              <div className='home-single-page__object-options_value'>{asset[e.value]}</div>
        }
      </li>
    ))

    return <ul className='home-single-page__object-options'>{list}</ul>
  }

  const tabsConfig = [
    {
      header: 'Description',
      tab: <Markdown className='pfda-padded-t20' data={asset.description} />,
    },
    {
      header: 'Archive Contents',
      tab: <ArchiveContents className='pfda-padded-t20' data={asset.archiveContent} />,
    },
    {
      header: `License: ${meta.object_license && meta.object_license.title}`,
      tab: <HomeLicense license={meta.object_license} link={asset.links.show_license} />,
      hide: !meta.object_license || !meta.object_license.uid,
    },
  ]

  const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''

  return (
    <HomeLayout hideTabs>
      <div className='home-single-page'>
        <div className='home-single-page__back-buttons'>
          <Link to={`/home/assets${tab}`}>
            <Icon icon='fa-arrow-left' />&nbsp;
            Back to Assets
          </Link>
          <Link to={`/home/assets${tab}`} className='home-single-page__back-buttons_cross'>
            <Icon icon='fa-times' />
          </Link>
        </div>
        <div className='home-single-page__main-info-container'>
          <div className='home-single-page__main-info-container_item'>
            <div className='home-single-page__header-section'>
              <div className='home-single-page__header-section_left-block'>
                <div className='home-single-page__header-section_title'>
                  <Icon icon='fa-file-zip-o' />&nbsp;
                  {asset.origin && asset.origin.text}
                </div>
              </div>
              <div className='home-single-page__header-section_right-block'>
                <ActionsDropdown
                  assets={[asset]}
                  editTags={meta.links.edit_tags && editTags}
                  attachTo={attachTo}
                  rename={rename}
                  deleteAsset={(link, uids) => deleteAsset(link, uids, tab)}
                  attachLicense={attachLicense}
                  assetsLicenseAction={assetsLicenseAction}
                  page='details'
                />
              </div>
            </div>
          </div>
          <div className='home-single-page__main-info-container_item'>
            {renderAssetOptions()}
          </div>
          {asset.tags.length > 0 &&
            <div className='home-single-page__main-info-container_item'>
              <div className='home-single-page__main-info-container_tags-container'>
                <TagsList tags={asset.tags} />
              </div>
            </div>
          }
        </div>
        <div className='pfda-padded-t40'>
          <TabsSwitch tabsConfig={tabsConfig} />
        </div>
      </div>
    </HomeLayout>
  )
}

HomeAssetSinglePage.propTypes = {
  assetDetails: PropTypes.object,
  currentTab: PropTypes.string,
  uid: PropTypes.string,
  fetchAssetDetails: PropTypes.func,
  setCurrentTab: PropTypes.func,
  attachTo: PropTypes.func,
  rename: PropTypes.func,
  deleteAsset: PropTypes.func,
  editTags: PropTypes.func,
  attachLicense: PropTypes.func,
  assetsLicenseAction: PropTypes.func,
}

HomeAssetSinglePage.defaultProps = {
  assetDetails: {},
}

const mapStateToProps = (state) => ({
  currentTab: homeCurrentTabSelector(state),
  assetDetails: homeAssetsAssetDetailsSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchAssetDetails: (uid) => dispatch(fetchAssetDetails(uid)),
  setCurrentTab: (tab) => dispatch(setCurrentTab(tab)),
  editTags: (uid, tags, suggestedTags) => dispatch(editAssetTags(uid, tags, suggestedTags)).then(({ status }) => {
    if (status === 200) dispatch(fetchAssetDetails(ownProps.uid))
  }),
  attachTo: (items, noteUids) => dispatch(assetsAttachTo(items, noteUids)),
  rename: (link, name, uid) => dispatch(renameAsset(link, name, uid)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetDetails(ownProps.uid))
  }),
  deleteAsset: (link, uids, tab) => dispatch(deleteObjects(link, OBJECT_TYPES.ASSET, uids)).then(({ status }) => {
    if (status === 200) ownProps.history.push(`/home/assets${tab}`)
  }),
  attachLicense: (link, scope, ids) => dispatch(assetsAttachLicence(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetDetails(ownProps.uid))
  }),
  assetsLicenseAction: (link) => dispatch(assetsLicenseAction(link)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchAssetDetails(ownProps.uid))
  }),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeAssetSinglePage))

export {
  HomeAssetSinglePage,
}
