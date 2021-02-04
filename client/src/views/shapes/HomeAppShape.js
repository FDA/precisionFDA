import PropTypes from 'prop-types'


const HomeAppsShape = {
  id: PropTypes.number,
  addedBy: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  addedByFullname: PropTypes.string,
  location: PropTypes.string,
  name: PropTypes.string,
  revision: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  links: PropTypes.object,
  dxid: PropTypes.string,
  uid: PropTypes.string,
  appSeriesId: PropTypes.number,
  readme: PropTypes.string,
  featured: PropTypes.bool,
  isChecked: PropTypes.bool,
}

const mapToHomeApp = (data) => ({
  id: data.id,
  addedBy: data.added_by,
  createdAtDateTime: data.created_at_date_time,
  addedByFullname: data.added_by_fullname,
  location: data.location,
  name: data.name,
  revision: data.revision,
  tags: data.tags || [],
  title: data.title,
  links: data.links,
  dxid: data.dxid,
  uid: data.uid,
  appSeriesId: data.app_series_id,
  readme: data.readme,
  featured: data.featured,
  isChecked: false,
})

export default HomeAppsShape

export {
  HomeAppsShape,
  mapToHomeApp,
}
