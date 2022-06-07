import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { any, isEmpty, isNil } from 'ramda'

import SpaceShape from '../../../shapes/SpaceShape'
import {
  spaceDataSelector,
  spaceIsFetchingSelector,
} from '../../../../reducers/spaces/space/selectors'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import Button from '../../Button'
import {
  createSpace,
  editSpace,
  fetchNewSpaceInfo,
  fetchSpace,
} from '../../../../actions/spaces'
import TextField from '../../FormComponents/TextField'
import TextareaField from '../../FormComponents/TextareaField'
import SpaceTypeSwitch from '../SpaceTypeSwitch'
import SubmitButton from './SubmitButton'
import {
  ERROR_PAGES,
  NEW_SPACE_PAGE_ACTIONS,
  SPACE_GROUPS,
  SPACE_PRIVATE,
  SPACE_PRIVATE_TYPE,
  SPACE_REVIEW,
  SPACE_STATUS_LOCKED,
  SPACE_VERIFICATION,
} from '../../../../constants'
import { LoaderWrapper } from '../../LoaderWrapper'
// eslint-disable-next-line
import { setErrorPage } from '../../ErrorWrapper/actions'

const RESTORE_DATA_ACTIONS = Object.keys(NEW_SPACE_PAGE_ACTIONS)

const NewSpaceFormComponent = ({
  onMount,
  loadSpace,
  action,
  space,
  info,
  setLockedPage,
  onEditClick,
  onCreateClick,
  spaceIsFetching,
  errors,
  contextUser,
  isSubmitting,
  onCancelClick,
}) => {
  const [mounted, setMounted] = useState(false)
  const [defaultsSet, setDefaultsSet] = useState(false)
  const [formData, setFormData] = useState({
    space_type: '',
    name: '',
    description: '',
    host_lead_dxuser: '',
    guest_lead_dxuser: '',
    sponsor_lead_dxuser: '',
    source_space_id: null,
    cts: '',
  })
  const { spaceId } = useParams()

  useEffect(() => {
    onMount().then(() => {
      if (RESTORE_DATA_ACTIONS.includes(action)) {
        loadSpace(spaceId).then(() => {
          if (space.sharedSpaceId) {
            loadSpace(space.sharedSpaceId).then(() => {
              setMounted(true)
            })
          } else {
            setMounted(true)
          }
        })
      } else {
        setMounted(true)
      }
    })
  }, [])

  useEffect(() => {
    // componentDidUpdate() {
    if (
      mounted &&
      RESTORE_DATA_ACTIONS.includes(action) &&
      space?.status === SPACE_STATUS_LOCKED
    ) {
      setLockedPage()
    }
    if (mounted && !defaultsSet) {
      setDefaultsSet(true)
      setFormData({
        ...formData,
        space_type: info.allowed_types.includes(SPACE_REVIEW)
          ? SPACE_REVIEW
          : info.allowed_types[0],
      })
    }

    if (space && RESTORE_DATA_ACTIONS.includes(action)) {
      setFormData({
        space_type: space.type || '',
        name: space.name || '',
        description: space.desc || '',
        host_lead_dxuser: space.hostLead?.dxuser || '',
        guest_lead_dxuser: space.guestLead?.dxuser || '',
        sponsor_lead_dxuser: space.guestLead?.dxuser || '',
        source_space_id: space.id || null,
        cts: space.cts || '',
      })
    }
  }, [mounted])

  useEffect(() => {
    if (![SPACE_REVIEW, SPACE_GROUPS].includes(space_type)) {
      const setLead = { host_lead_dxuser: contextUser.dxuser }
      setFormData({
        ...formData,
        ...setLead,
      })
    } else {
      setFormData(prevData => ({ ...prevData, host_lead_dxuser: '' }))
    }
  }, [formData.space_type])

  const filedChangeHandler = e => {
    const { currentTarget } = e
    setFormData({
      ...formData,
      [currentTarget.name]:
        currentTarget.type === 'checkbox'
          ? currentTarget.checked
          : currentTarget.value,
    })
  }

  const createClickHandler = () => {
    onCreateClick(formData)
  }

  const editClickHandler = () => {
    onEditClick(formData, spaceId).then(statusIsOk => {
      if (statusIsOk) loadSpace(spaceId)
    })
  }

  const submitClickHandler = () => {
    // from componentWillUnmount
    setMounted(false)
    setDefaultsSet(false)

    switch (action) {
      case NEW_SPACE_PAGE_ACTIONS.EDIT:
        return editClickHandler()
      default:
        return createClickHandler()
    }
  }

  const disableButtons =
    isSubmitting ||
    info.isFetching ||
    (spaceIsFetching && RESTORE_DATA_ACTIONS.includes(action))
  const {
    space_type,
    name,
    description,
    host_lead_dxuser,
    guest_lead_dxuser,
    sponsor_lead_dxuser,
  } = formData

  const currentUserDxuser = contextUser?.dxuser
  const spaceTypeEditing = !!space?.id

  if (space_type === SPACE_REVIEW) {
    var isEditing = false
  } else if (
    space_type === SPACE_GROUPS &&
    action === NEW_SPACE_PAGE_ACTIONS.EDIT
  ) {
    isEditing = true
  }

  if (action === NEW_SPACE_PAGE_ACTIONS.EDIT) {
    if (space.hostLead !== undefined && space_type === SPACE_REVIEW) {
      const hostLeadCurrentUser = space?.hostLead.dxuser !== currentUserDxuser
      isEditing = spaceTypeEditing && hostLeadCurrentUser
    }
  }

  const requiredParams = [space_type, name, description]
  if (space_type === SPACE_REVIEW) {
    requiredParams.push(host_lead_dxuser, sponsor_lead_dxuser)
  } else if (space_type === SPACE_GROUPS) {
    requiredParams.push(host_lead_dxuser, guest_lead_dxuser)
  }

  const disableAction =
    disableButtons ||
    any(e => isNil(e) || isEmpty(e) || !e?.trim().length)(requiredParams)

  if (!mounted) {
    return (
      <LoaderWrapper>
        <span>Loading space...</span>
      </LoaderWrapper>
    )
  }

  var allowedTypes = info.allowed_types

  if (space.type) {
    allowedTypes = [space.type]
  }

  const typeDisplay = type => {
    if (type === SPACE_PRIVATE_TYPE) {
      return SPACE_PRIVATE
    } else {
      return type
    }
  }

  return (
    <div className="form new-space-form">
      <div className="form-group">
        <label className="control-label">Space type:</label>
        <div className="space-type-container">
          {allowedTypes.map(type => (
            <SpaceTypeSwitch
              key={type}
              label={typeDisplay(type)}
              disabled={spaceTypeEditing}
              name="space_type"
              checked={space_type === type}
              value={type}
              onChange={filedChangeHandler}
              aria-label={type + ' radio button'}
            />
          ))}
        </div>
      </div>

      <TextField
        name="name"
        label="Name (required):"
        placeholder="Name this space..."
        value={name}
        status={errors.name && 'error'}
        helpText={errors.name && errors.name[0]}
        onChange={filedChangeHandler}
      />

      <TextareaField
        name="description"
        label="Description (required):"
        placeholder="What is this space about..."
        value={description}
        helpText={errors.description && errors.description[0]}
        status={errors.description && 'error'}
        onChange={filedChangeHandler}
      />

      {[SPACE_VERIFICATION, SPACE_GROUPS, SPACE_REVIEW].includes(
        space_type,
      ) && (
        <TextField
          name="host_lead_dxuser"
          value={host_lead_dxuser}
          disabled={isEditing}
          label={`${
            space_type === SPACE_REVIEW ? 'Reviewer' : 'Host'
          } Lead (required):`}
          status={errors.host_lead_dxuser && 'error'}
          helpText={errors.host_lead_dxuser && errors.host_lead_dxuser[0]}
          onChange={filedChangeHandler}
        />
      )}

      {[SPACE_VERIFICATION, SPACE_GROUPS].includes(space_type) && (
        <>
          <TextField
            name="host_lead_dxuser"
            value={host_lead_dxuser}
            disabled={isEditing}
            label={`${
              space_type === SPACE_REVIEW ? 'Reviewer' : 'Host'
            } Lead (required):`}
            status={errors.host_lead_dxuser && 'error'}
            helpText={errors.host_lead_dxuser && errors.host_lead_dxuser[0]}
            onChange={filedChangeHandler}
          />

          <TextField
            name="guest_lead_dxuser"
            value={guest_lead_dxuser}
            disabled={isEditing}
            label={`Space Lead (${
              space_type === SPACE_GROUPS ? 'required' : 'optional'
            }):`}
            status={errors.guest_lead_dxuser && 'error'}
            helpText={errors.guest_lead_dxuser && errors.guest_lead_dxuser[0]}
            onChange={filedChangeHandler}
          />
        </>
      )}

      {space_type === SPACE_REVIEW && (
        <TextField
          name="sponsor_lead_dxuser"
          value={sponsor_lead_dxuser}
          disabled={isEditing}
          label="Sponsor Lead (required):"
          status={errors.sponsor_lead_dxuser && 'error'}
          helpText={errors.sponsor_lead_dxuser && errors.sponsor_lead_dxuser[0]}
          onChange={filedChangeHandler}
        />
      )}

      {[SPACE_VERIFICATION, SPACE_GROUPS, SPACE_REVIEW].includes(
        space_type,
      ) && (
        <TextField
          name="cts"
          label="Center Tracking System # (optional):"
          status={errors.cts && 'error'}
          helpText={errors.cts && errors.cts[0]}
          onChange={filedChangeHandler}
        >
          <span>
            FDA uses the Center Tracking System (CTS) to track the progress of
            industry submitted pre-market documents through the review process.
            CTS is a workflow/work management system that provides support for
            the Center for Devices and Radiogical Health (CDRH) business
            processes and business rules, for all stages of the product
            lifecycle for medical devices.
          </span>
        </TextField>
      )}

      <div className="form-group">
        <SubmitButton
          action={action}
          submitClickHandler={submitClickHandler}
          disabled={disableAction}
          isSubmitting={isSubmitting}
        />
        <Button onClick={onCancelClick} disabled={disableButtons}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

NewSpaceFormComponent.propTypes = {
  space: PropTypes.shape(SpaceShape),
  contextUser: PropTypes.object,
  isSubmitting: PropTypes.bool,
  info: PropTypes.shape({
    allowed_types: PropTypes.array,
    isFetching: PropTypes.bool,
  }),
  spaceIsFetching: PropTypes.bool,
  errors: PropTypes.object,
  onCreateClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
  onMount: PropTypes.func,
  loadSpace: PropTypes.func,
  action: PropTypes.string,
  setLockedPage: PropTypes.func,
}

NewSpaceFormComponent.defaultProps = {
  isSubmitting: false,
  spaceIsFetching: false,
  info: {
    allowed_types: [],
    isFetching: false,
  },
  errors: {},
  onMount: () => Promise.resolve(),
  loadSpace: () => {},
}

const mapStateToProps = (state, { onCancelClick }) => ({
  ...state.spaces.newSpace,
  space: spaceDataSelector(state),
  spaceIsFetching: spaceIsFetchingSelector(state),
  contextUser: contextUserSelector(state),
  onCancelClick,
})

const mapDispatchToProps = dispatch => ({
  onCreateClick: params => {
    dispatch(createSpace(params))
  },
  onEditClick: (params, spaceId) => dispatch(editSpace(params, spaceId)),
  onMount: () => dispatch(fetchNewSpaceInfo()), // get { allowed_types: space_types }
  loadSpace: spaceId => dispatch(fetchSpace(spaceId)),
  setLockedPage: () => dispatch(setErrorPage(ERROR_PAGES.LOCKED_SPACE)),
})

export const NewSpaceForm = connect(mapStateToProps, mapDispatchToProps)(NewSpaceFormComponent)
