import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { homeDatabasesListSelector } from '../../../../../reducers/home/databases/selectors'
import {
  fetchDatabases,
  resetDatabasesModals,
  resetDatabasesFiltersValue,
  setDatabaseFilterValue,
  runDatabasesAction,
  // copyToSpaceDatabases,
  // attachLicenseFiles,
  // databasesLicenseAction,
  // databasesAcceptLicenseAction,
} from '../../../../../actions/home'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import HomeLayout from '../../../../layouts/HomeLayout'
import { HomeDatabasesTable } from '../../../../components/Home/Databases/HomeDatabasesTable'
import ActionsDropdown from '../../../../components/Home/Databases/ActionsDropdown'
import HomeDatabasesShape from '../../../../shapes/HomeDatabaseShape'


const HomeDatabasesListPage = ({
  databases = [],
  fetchDatabases,
  resetDatabasesModals,
  resetDatabasesFiltersValue,
  setDatabaseFilterValue,
  runDatabasesAction,
  // copyToSpace,
  // databasesLicenseAction,
  // attachLicense,
  // databasesAcceptLicenseAction,
}) => {

  useLayoutEffect(() => {
    resetDatabasesModals()
    resetDatabasesFiltersValue()
    fetchDatabases()
  }, [])

  const checkedDatabases = databases.filter(database => database.isChecked)

  const handleFilterValue = (value) => {
    setDatabaseFilterValue(value)
    fetchDatabases()
  }

  return (
    <HomeLayout hideTabs={false}>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions'>
          <Link to='/home/databases/new'>
            <Button type='primary'>
              <span>
                <Icon icon='fa-plus' />&nbsp;
                Add Database
              </span>
            </Button>
          </Link>
        </div>
        <div className='home-page-layout__actions--right'>
          <ActionsDropdown
            databases={checkedDatabases}
            runDatabasesAction={runDatabasesAction}
            // copyToSpace={copyToSpace}
            // attachLicense={attachLicense}
            // databasesLicenseAction={databasesLicenseAction}
            // databasesAcceptLicenseAction={databasesAcceptLicenseAction}
          />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeDatabasesTable databases={databases} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeDatabasesListPage.propTypes = {
  databases: PropTypes.arrayOf(PropTypes.exact(HomeDatabasesShape)),
  fetchDatabases: PropTypes.func,
  resetDatabasesModals: PropTypes.func,
  resetDatabasesFiltersValue: PropTypes.func,
  setDatabaseFilterValue: PropTypes.func,
  runDatabasesAction: PropTypes.func,
  // copyToSpace: PropTypes.func,
  // attachLicense: PropTypes.func,
  // databasesLicenseAction: PropTypes.func,
}

const mapStateToProps = (state) => ({
  databases: homeDatabasesListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchDatabases: () => dispatch(fetchDatabases()),
  resetDatabasesModals: () => dispatch(resetDatabasesModals()),
  resetDatabasesFiltersValue: () => dispatch(resetDatabasesFiltersValue()),
  setDatabaseFilterValue: (value) => dispatch(setDatabaseFilterValue(value)),
  runDatabasesAction: (link, api_method, dxids) => dispatch(runDatabasesAction(link, api_method, dxids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchDatabases())
  }),

  // to add later:
  // in attachLicense: folderId ?
  // attachLicense: (link, scope, ids) => dispatch(attachLicenseFiles(link, scope, ids)).then(({ statusIsOK }) => {
  //   if (statusIsOK) dispatch(fetchDatabases())
  // }),
  // databasesLicenseAction: (link) => dispatch(databasesLicenseAction(link)).then(({ statusIsOK }) => {
  //   if (statusIsOK) dispatch(fetchDatabases())
  // }),
  // copyToSpace: (scope, ids) => dispatch(copyToSpaceDatabases(scope, ids)).then(({ status }) => {
  //   if (status) dispatch(fetchDatabases())
  // }),
})

export const HomeDatabasesPage = connect(mapStateToProps, mapDispatchToProps)(HomeDatabasesListPage)
