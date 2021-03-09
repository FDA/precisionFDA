import React from 'react'
import PropTypes from 'prop-types'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import Icon from '../../../Icon'
import { HOME_FILES_ACTIONS } from '../../../../../constants'
import LinkTargetBlank from '../../../LinkTargetBlank'


const Item = ({ asset, action }) => (
  <tr>
    <td>
      <Icon icon='fa-file-zip-o' fw />
      <span>{asset.name}</span>
    </td>
    <td>
      <a href={asset.links.user} className='objects-actions-modal__help-block'>{asset.createdBy}</a>
    </td>
    {(action === HOME_FILES_ACTIONS.DOWNLOAD) && (
      <td style={{ textAlign: 'center' }}>
        <LinkTargetBlank url={asset.links.download}>
          <Icon icon="fa-download" fw />
          <span style={{ marginLeft: 5 }} >download</span>
        </LinkTargetBlank>
      </td>
    )}
  </tr>
)

const AssetsList = ({ assets = [], action }) => (
  <table className='table objects-actions-modal__table'>
    <tbody>
      {assets.map((e) => <Item asset={e} key={e.id} action={action} />)}
    </tbody>
  </table>
)

AssetsList.propTypes = {
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  action: PropTypes.string,
}

Item.propTypes = {
  asset: PropTypes.exact(HomeAssetShape),
  action: PropTypes.string,
}

export default AssetsList
