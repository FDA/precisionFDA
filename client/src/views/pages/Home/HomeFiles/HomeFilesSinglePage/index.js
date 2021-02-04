import React, { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import HomeLayout from '../../../../layouts/HomeLayout'
import Icon from '../../../../components/Icon'
import Loader from '../../../../components/Loader'
import TagsList from '../../../../components/TagsList'
import TabsSwitch from '../../../../components/TabsSwitch'
import HomeEditTagsModal from '../../../../components/Home/HomeEditTagsModal'
import {
  homeFilesGetFileDetails,
  homeFilesEditTagsModalSelector,
} from '../../../../../reducers/home/files/selectors'
import { HOME_TABS, OBJECT_TYPES } from '../../../../../constants'
import ActionsDropdown from '../../../../components/Home/Files/ActionsDropdown'
import {
  fetchFileDetails,
  deleteObjects,
  copyToSpaceFiles,
  filesAttachTo,
  attachLicenseFiles,
  setCurrentTab,
  renameFile,
  showFileEditTagsModal,
  hideFileEditTagsModal,
  editFileTags,
  filesMove,
  filesLicenseAction,
} from '../../../../../actions/home'
import { getSelectedTab } from '../../../../../helpers/home'
import HomeLicense from '../../../../components/Home/HomeLicense'


const HomeFilesSinglePage = (props) => {
  const { fileDetails, currentTab, uid, fetchFileDetails, deleteFiles, copyToSpace, filesAttachTo, attachLicense, renameFile } = props
  const { editTagsModal, showFileEditTagsModal, hideFileEditTagsModal, editFileTags, filesMove, filesLicenseAction } = props

  useLayoutEffect(() => {
    if (uid) fetchFileDetails(uid)
  }, [uid])

  const { file, meta, isFetching } = fileDetails

  if (!currentTab && file && file.links) {
    const selectedTab = getSelectedTab(file.location, file.links.space)
    setCurrentTab(selectedTab)
  }

  if (isFetching) {
    return (
      <HomeLayout hideTabs>
        <div className='text-center'>
          <Loader />
        </div>
      </HomeLayout>
    )
  }

  if (!file || !file.id) return <HomeLayout><span>File not found</span></HomeLayout>

  const renderFileOptions = () => {
    const columns = [
      {
        header: 'location',
        value: 'location',
        link: true,
      },
      {
        header: 'id',
        value: 'uid',
      },
      {
        header: 'added by',
        value: 'addedBy',
      },
      {
        header: 'origin',
        value: 'origin',
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

    const fileValue = (elem, file) => {
      if (elem === 'location') {
        return file.links.space ?
        <Link target='_blank' to={file.links.space}>{file[elem]}</Link> :
        <Link to={`/home/files${tab}`}>{file[elem]}</Link>
      } else if (elem === 'origin') {
        if (file.links.origin_object.origin_type === 'Job') {
          return <Link target='_blank' to={`/home/jobs/${file.links.origin_object.origin_uid}`}>{file.origin.text}</Link>
        } else if (file.origin.text) {
          return (
            <Link to={file.links.origin_object.origin_uid ? `/home/files/${file.links.origin_object.origin_uid}` : ''}>
              <i className={file.origin.fa} />&nbsp;
              {file.origin.text}
            </Link>
          )
        } else return file[elem]
      } else if (elem === 'addedBy') {
        return <Link target='_blank' to={file.links.user}>{file[elem]}</Link>
      } return file[elem]
    }

    const list = columns.map((e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        <div className='home-single-page__object-options_value'>{
          fileValue(e.value, file)
        }</div>
      </li>
    ))

    return <ul className='home-single-page__object-options'>{list}</ul>
  }

  const tabsConfig = [
    {
      header: `License: ${meta.object_license && meta.object_license.title}`,
      tab: <HomeLicense license={meta.object_license} link={file.links.show_license} />,
      hide: !meta.object_license || !meta.object_license.uid,
    },
  ]

  const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''

  return (
    <HomeLayout hideTabs>
      <div className='home-single-page'>
        <div className='home-single-page__back-buttons'>
          <Link to={`/home/files${tab}`}>
            <Icon icon='fa-arrow-left' />&nbsp;
            Back to Files
          </Link>
          <Link to={`/home/files${tab}`} className='home-single-page__back-buttons_cross'>
            <Icon icon='fa-times' />
          </Link>
        </div>
        <div className='home-single-page__main-info-container'>
          <div className='home-single-page__main-info-container_item'>
            <div className='home-single-page__header-section'>
              <div className='home-single-page__header-section_left-block'>
                <div className='home-single-page__header-section_title'>
                  <Icon icon='fa-files-o' />&nbsp;
                  {file.name}
                  <h3 className="description">{file.desc}</h3>
                </div>
                <div className='home-single-page__header-section_description'>{file.description ? file.description : 'This file has no description.'}</div>
              </div>
              <div className='home-single-page__header-section_right-block'>
                <ActionsDropdown
                  files={[file]}
                  copyToSpace={copyToSpace}
                  filesAttachTo={filesAttachTo}
                  attachLicense={attachLicense}
                  deleteFiles={(link, ids) => deleteFiles(link, ids)}
                  page='details'
                  renameFile={renameFile}
                  editTags={meta.links.edit_tags && showFileEditTagsModal}
                  filesMove={filesMove}
                  filesLicenseAction={filesLicenseAction}
                />
              </div>
            </div>
          </div>
          <div className='home-single-page__main-info-container_item'>
            {renderFileOptions()}
          </div>
          {file.tags.length > 0 &&
            <div className='home-single-page__main-info-container_item'>
              <div className='home-single-page__main-info-container_tags-container'>
                <TagsList tags={file.tags} />
              </div>
            </div>
          }
        </div>
        <div className='pfda-padded-t40' />
        <TabsSwitch tabsConfig={tabsConfig} />
      </div>
      <HomeEditTagsModal
        isOpen={editTagsModal.isOpen}
        isLoading={editTagsModal.isLoading}
        name={file.title}
        tags={file.tags}
        showSuggestedTags
        hideAction={hideFileEditTagsModal}
        updateAction={(tags, suggestedTags) => editFileTags(uid, tags, suggestedTags)}
      />
    </HomeLayout>
  )
}

HomeFilesSinglePage.propTypes = {
  fileDetails: PropTypes.object,
  currentTab: PropTypes.string,
  uid: PropTypes.string,
  fetchFileDetails: PropTypes.func,
  deleteFiles: PropTypes.func,
  copyToSpace: PropTypes.func,
  filesAttachTo: PropTypes.func,
  attachLicense: PropTypes.func,
  renameFile: PropTypes.func,
  editTagsModal: PropTypes.object,
  showFileEditTagsModal: PropTypes.func,
  hideFileEditTagsModal: PropTypes.func,
  editFileTags: PropTypes.func,
  filesMove: PropTypes.func,
  filesLicenseAction: PropTypes.func,
}

HomeFilesSinglePage.defaultProps = {
  fileDetails: {},
}

const mapStateToProps = (state) => ({
  fileDetails: homeFilesGetFileDetails(state),
  editTagsModal: homeFilesEditTagsModalSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchFileDetails: (uid) => dispatch(fetchFileDetails(uid)),
  deleteFiles: (link, ids) => dispatch(deleteObjects(link, OBJECT_TYPES.FILE, ids)).then(({ status }) => {
    if (status) {
      const tab = ownProps.currentTab && ownProps.currentTab !== HOME_TABS.PRIVATE ? `/${ownProps.currentTab.toLowerCase()}` : ''
      ownProps.history.push(`/home/files${tab}`)
    }
  }),
  copyToSpace: (scope, ids, uid) => dispatch(copyToSpaceFiles(scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFileDetails(uid))
  }),
  filesAttachTo: (items, noteUids) => dispatch(filesAttachTo(items, noteUids)),
  attachLicense: (link, scope, ids) => dispatch(attachLicenseFiles(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFileDetails(ownProps.uid))
  }),
  renameFile: (link, name, type, folder) => dispatch(renameFile(link, name, type, folder)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFileDetails(ownProps.uid))
  }),
  editFileTags: (fileSeriesId, tags, suggestedTags) => dispatch(editFileTags(fileSeriesId, tags, suggestedTags)).then(({ status }) => {
    if (status) dispatch(fetchFileDetails(ownProps.uid))
  }),
  showFileEditTagsModal: () => dispatch(showFileEditTagsModal()),
  hideFileEditTagsModal: () => dispatch(hideFileEditTagsModal()),
  filesMove: (nodeIds, targetId, link) => dispatch(filesMove(nodeIds, targetId, link)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFileDetails(ownProps.uid))
  }),
  filesLicenseAction: (link) => dispatch(filesLicenseAction(link)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFileDetails(ownProps.uid))
  }),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeFilesSinglePage))

export {
  HomeFilesSinglePage,
}
