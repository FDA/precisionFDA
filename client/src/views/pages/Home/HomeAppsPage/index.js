import React from 'react'
import { Link } from 'react-router-dom'

import Icon from '../../../components/Icon'
import Button from '../../../components/Button'
import HomeLayout from '../../../layouts/HomeLayout'
import DropdownMenu from '../.././../components/DropdownMenu'
import HomeAppsTable from '../../../components/Home/Apps/HomeAppsTable'


const apps = [
  {
    'id': 36,
    'name': 'app_jonh_new_str',
    'title': 'app_jonh_new_str',
    'addedBy': 'pfda_autotest1',
    'createdAt': '09/21/2020',
    'revision': 1,
    'runByYou': 'Try',
    'org': 'autotestorg1',
    'explorers': 0,
    'links': {
      'show': '/apps/app-FxZBPK80q284xk7047b2B92Q-1',
      'user': '/users/pfda_autotest1',
      'run_job': '/apps/app-FxZBPK80q284xk7047b2B92Q-1/jobs/new',
    },
    'tags': [],
  },
  {
    'id': 37,
    'name': 'app_jonh_new_str',
    'title': 'app_jonh_new_str',
    'addedBy': 'pfda_autotest1',
    'createdAt': '09/21/2020',
    'revision': 1,
    'runByYou': 'Try',
    'org': 'autotestorg1',
    'explorers': 0,
    'links': {
      'show': '/apps/app-FxZBPK80q284xk7047b2B92Q-1',
      'user': '/users/pfda_autotest1',
      'run_job': '/apps/app-FxZBPK80q284xk7047b2B92Q-1/jobs/new',
    },
    'tags': [],
  },
]


const HomeAppsPage = () => {
  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className='home-page-layout__actions'>
          <Link to='/my_home/apps/me'>
            <Button type='primary' >
              <span>
                <Icon icon='fa-cubes' />&nbsp;
                Create App
              </span>
            </Button>
          </Link>
        </div>
        <div className='home-page-layout__actions'>
          <DropdownMenu title='Actions' />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeAppsTable apps={apps} />
      </div>
    </HomeLayout>
  )
}

export default HomeAppsPage
