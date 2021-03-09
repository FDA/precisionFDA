import React from 'react'
import PropTypes from 'prop-types'

import { HomeAppsShape } from '../../../../shapes/HomeAppShape'
import Icon from '../../../Icon'


const Item = ({ app }) => (
  <tr>
    <td>
      <Icon icon='fa-app-o' fw />
      <span>{app.title}</span>
    </td>
    <td>
      <a href={app.links.user} className='objects-actions-modal__help-block'>{app.createdBy}</a>
    </td>
  </tr>
)

const AppsList = ({ apps = []}) => (
  <table className='table objects-actions-modal__table'>
    <tbody>
      {apps.map((app) => <Item app={app} key={app.id}/>)}
    </tbody>
  </table>
)

AppsList.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppsShape)),
  action: PropTypes.string,
}

Item.propTypes = {
  app: PropTypes.exact(HomeAppsShape),
  action: PropTypes.string,
}

export default AppsList
