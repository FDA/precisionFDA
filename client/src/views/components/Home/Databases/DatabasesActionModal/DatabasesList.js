import React from 'react'
import PropTypes from 'prop-types'

import Icon from '../../../Icon'
import HomeDatabasesShape from '../../../../shapes/HomeDatabaseShape'


const Item = ({ database }) => (
  <tr>
    <td>
      <Icon icon='fa-database-o' fw />
      <span>{database.name}</span>
    </td>
    <td>
      <a href={database.links.user} className='objects-actions-modal__help-block'>{database.addedBy}</a>
    </td>
  </tr>
)

const DatabasesList = ({ databases = []}) => (
  <table className='table objects-actions-modal__table'>
    <tbody>
      {databases.map((database) => <Item database={database} key={database.id}/>)}
    </tbody>
  </table>
)

DatabasesList.propTypes = {
  databases: PropTypes.arrayOf(PropTypes.exact(HomeDatabasesShape)),
  action: PropTypes.string,
}

Item.propTypes = {
  database: PropTypes.exact(HomeDatabasesShape),
  action: PropTypes.string,
}

export default DatabasesList
