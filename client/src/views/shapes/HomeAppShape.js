import PropTypes from 'prop-types'


const HomeAppsShape = {
  id: PropTypes.number,
  addedBy: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  name: PropTypes.string,
  revision: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  links: PropTypes.object,
  isChecked: PropTypes.bool,
}

const mapToHomeApp = (data) => ({
  id: data.id,
  addedBy: data.added_by,
  createdAtDateTime: data.created_at_date_time,
  name: data.name,
  revision: data.revision,
  tags: data.tags || [],
  title: data.title,
  links: data.links,
  isChecked: false,
})

export default HomeAppsShape

export {
  HomeAppsShape,
  mapToHomeApp,
}