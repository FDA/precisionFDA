import PropTypes from 'prop-types'

import { convertDateToUserTime } from '../../utils/datetime'


const AppShape = {
  id: PropTypes.number,
  dxid: PropTypes.string,
  addedBy: PropTypes.string,
  createdAt: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  updatedAt: PropTypes.object,
  explorers: PropTypes.number,
  org: PropTypes.string,
  name: PropTypes.string,
  revision: PropTypes.number,
  runByYou: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  entityType: PropTypes.string,
  links: PropTypes.object,
  isChecked: PropTypes.bool,
}

const mapToApp = (data) => ({
  id: data.id,
  dxid: data.dxid,
  addedBy: data.added_by,
  createdAt: data.created_at,
  createdAtDateTime: data.created_at_date_time,
  updatedAt: convertDateToUserTime(data.updated_at),
  explorers: data.explorers,
  name: data.name,
  org: data.org,
  revision: data.revision,
  runByYou: data.run_by_you,
  tags: data.tags || [],
  title: data.title,
  entityType: data.entity_type,
  links: data.links,
  isChecked: false,
})

export default AppShape

export {
  AppShape,
  mapToApp,
}
