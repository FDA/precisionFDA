import React, { useLayoutEffect } from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeLayout from '../../../../layouts/HomeLayout'
import { HomeDatabasesCreateForm } from '../../../../components/Home/Databases/HomeDatabasesCreateForm'
import Button from '../../../../components/Button'
import { getSelectedTab } from '../../../../../helpers/home'
import { setCurrentTab } from '../../../../../actions/home'
import { HOME_DATABASES_ACTIONS } from '../../../../../constants'


const HomeDatabasesCreatePageLayout = ({
  currentTab,
  action,
  setCurrentTab,
}) => {
  useLayoutEffect(() => {
    const selectedTab = getSelectedTab(currentTab, '')
    setCurrentTab(selectedTab)
  }, [])
  const history = useHistory()
  const title = (action === HOME_DATABASES_ACTIONS.CREATE) ? 'Create Database' : 'Edit Database'

  return (
    <HomeLayout hideTabs={true}>
      <div className='home-page-layout__header-row'>
        <div className="pull-left">
          <h1>{title}</h1>
        </div>
        <div className='home-page-layout__actions--right'>
          <Button onClick={() => history.goBack()} size="lg" type="primary">Back</Button>
        </div>
      </div>
      <HomeDatabasesCreateForm
        currentTab={currentTab}
        action={action}
      />
    </HomeLayout>
  )
}

HomeDatabasesCreatePageLayout.propTypes = {
  currentTab: PropTypes.string,
  history: PropTypes.object,
  setCurrentTab: PropTypes.func,
  action: PropTypes.string,
}

HomeDatabasesCreatePageLayout.defaultProps = {
  databaseDetails: {},
}

const mapStateToProps = () => ({
})

const mapDispatchToProps = (dispatch) => ({
  setCurrentTab: (tab) => dispatch(setCurrentTab(tab)),
})

export const HomeDatabasesCreatePage = connect(mapStateToProps, mapDispatchToProps)(HomeDatabasesCreatePageLayout)
