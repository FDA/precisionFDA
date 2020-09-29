import PropTypes from 'prop-types'


const AppShape = {
  id: PropTypes.number,
  addedBy: PropTypes.string,
  createdAt: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  explorers: PropTypes.number,
  org: PropTypes.string,
  name: PropTypes.string,
  revision: PropTypes.number,
  runByYou: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  links: PropTypes.object,
  isChecked: PropTypes.bool,
}

const mapToApp = (data) => ({
  id: data.id,
  addedBy: data.added_by,
  createdAt: data.created_at,
  createdAtDateTime: data.created_at_date_time,
  explorers: data.explorers,
  name: data.name,
  org: data.org,
  revision: data.revision,
  runByYou: data.run_by_you,
  tags: data.tags || [],
  title: data.title,
  links: data.links,
  isChecked: false,
})

export default AppShape

export {
  AppShape,
  mapToApp,
}
