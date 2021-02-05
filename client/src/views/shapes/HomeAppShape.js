import PropTypes from 'prop-types'


const HomeAppsShape = {
  id: PropTypes.number,
  addedBy: PropTypes.string,
  createdAtDateTime: PropTypes.string,
<<<<<<< HEAD
  addedByFullname: PropTypes.string,
  location: PropTypes.string,
=======
>>>>>>> production
  name: PropTypes.string,
  revision: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  links: PropTypes.object,
<<<<<<< HEAD
  dxid: PropTypes.string,
  uid: PropTypes.string,
  appSeriesId: PropTypes.number,
  readme: PropTypes.string,
  featured: PropTypes.bool,
=======
>>>>>>> production
  isChecked: PropTypes.bool,
}

const mapToHomeApp = (data) => ({
  id: data.id,
  addedBy: data.added_by,
  createdAtDateTime: data.created_at_date_time,
<<<<<<< HEAD
  addedByFullname: data.added_by_fullname,
  location: data.location,
=======
>>>>>>> production
  name: data.name,
  revision: data.revision,
  tags: data.tags || [],
  title: data.title,
  links: data.links,
<<<<<<< HEAD
  dxid: data.dxid,
  uid: data.uid,
  appSeriesId: data.app_series_id,
  readme: data.readme,
  featured: data.featured,
=======
>>>>>>> production
  isChecked: false,
})

export default HomeAppsShape

export {
  HomeAppsShape,
  mapToHomeApp,
<<<<<<< HEAD
}
=======
}
>>>>>>> production
