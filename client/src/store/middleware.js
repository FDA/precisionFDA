import {
  ADD_DATA_TO_SPACE_SUCCESS,
  LOCK_SPACE_SUCCESS,
  SPACE_DELETE_FILES_SUCCESS,
  SPACE_PUBLISH_FILES_SUCCESS,
  UNLOCK_SPACE_SUCCESS,
} from '../actions/spaces/types'
import { spaceDataSelector } from '../reducers/spaces/space/selectors'
import { fetchSpace } from '../actions/spaces/fetchSpace'
import { hideUploadModal } from '../features/space/fileUpload/actions'


export const spacesMiddleware = ({ dispatch, getState }) => next => action => {
  const spaceId = spaceDataSelector(getState()).id

  switch (action.type) {
    case ADD_DATA_TO_SPACE_SUCCESS:
    case SPACE_DELETE_FILES_SUCCESS:
    case SPACE_PUBLISH_FILES_SUCCESS:
    case LOCK_SPACE_SUCCESS:
    case UNLOCK_SPACE_SUCCESS:
    case hideUploadModal.type:
      dispatch(fetchSpace(spaceId))
    // eslint-disable-next-line no-fallthrough
    default:
      return next(action)
  }
}
