import React, { FunctionComponent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { any, isEmpty, isNil } from 'ramda'

import { spaceDataSelector, spaceIsFetchingSelector } from '../../../../reducers/spaces/space/selectors'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import Button from '../../Button'
import { createSpace, editSpace, fetchNewSpaceInfo, fetchSpace } from '../../../../actions/spaces'
import TextField from '../../FormComponents/TextField'
import TextareaField from '../../FormComponents/TextareaField'
import SpaceTypeSwitch from '../SpaceTypeSwitch'
import SubmitButton from './SubmitButton'
import './style.sass'
import {
  ERROR_PAGES,
  NEW_SPACE_PAGE_ACTIONS,
  SPACE_ADMINISTRATOR,
  SPACE_GOVERNMENT,
  SPACE_GROUPS,
  SPACE_PRIVATE,
  SPACE_PRIVATE_TYPE,
  SPACE_REVIEW,
  SPACE_STATUS_LOCKED,
  SPACE_VERIFICATION,
} from '../../../../constants'
import { LoaderWrapper } from '../../LoaderWrapper'
import { getGuestLeadLabel, getHostLeadLabel } from '../../../../helpers/spaces'
import { setErrorPage } from '../../ErrorWrapper/actions'
import { ISpace } from '../../../../types/space'

const RESTORE_DATA_ACTIONS = [NEW_SPACE_PAGE_ACTIONS.DUPLICATE, NEW_SPACE_PAGE_ACTIONS.EDIT]

interface INewSpaceModalFormProps {
  onMount: () => any
  loadSpace: (spaceId: number) => ISpace | any
  action: string
  space: ISpace | any
  spaceId: string
  info: {
    allowed_types: []
    isFetching: boolean
  }
  setLockedPage: () => void
  onEditClick: (formData: ISpaceFormDataProps, spaceId: string) => any
  onCreateClick: (formData: ISpaceFormDataProps) => any
  spaceIsFetching: boolean
  errors: any
  contextUser: any
  isSubmitting: boolean
  isEditing: boolean
  onCancelClick: () => any
}

interface ISpaceFormDataProps {
  space_type: string
  name: string
  description: string
  host_lead_dxuser: string
  guest_lead_dxuser: string
  sponsor_lead_dxuser: string
  source_space_id: null
  cts: string
}

const NewSpaceModalFormComponent: FunctionComponent<INewSpaceModalFormProps> = ({
  isSubmitting = false,
  spaceIsFetching = false,
  info = {
    allowed_types: [],
    isFetching: false,
  },
  action = '',
  space = {},
  errors = {},
  onMount = () => Promise.resolve(),
  loadSpace = () => {},
  setLockedPage = () => {},
  onCreateClick = () => Promise.resolve(),
  onCancelClick = () => {},
  onEditClick = () => {},
  contextUser = {},
}: INewSpaceModalFormProps) => {
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
  // @ts-ignore
  const { spaceId } = useParams()

  useEffect(() => {
    onMount().then(() => {
      if (spaceId === undefined && action === NEW_SPACE_PAGE_ACTIONS.EDIT && RESTORE_DATA_ACTIONS.includes(action)) {
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
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && RESTORE_DATA_ACTIONS.includes(action) && space?.status === SPACE_STATUS_LOCKED) {
      setLockedPage()
    }
    if (mounted && !defaultsSet) {
      setDefaultsSet(true)
      setFormData({
        ...formData,
        // setup default space_type checked
        space_type: SPACE_PRIVATE_TYPE,
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
        // @ts-ignore
        source_space_id: space.id || null,
        cts: space.cts || '',
      })
    }
  }, [mounted])

  if (action === NEW_SPACE_PAGE_ACTIONS.CREATE) {
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
  }

  const filedChangeHandler = (e: any) => {
    const { currentTarget } = e
    setFormData({
      ...formData,
      [currentTarget.name]: currentTarget.type === 'checkbox' ? currentTarget.checked : currentTarget.value,
    })
  }

  const createClickHandler = () => {
    onCreateClick(formData).then((statusIsOk: any) => {
      if (statusIsOk) {
        onCancelClick()
        onMount()
      }
    })
  }

  const editClickHandler = () => {
    onEditClick(formData, spaceId).then((statusIsOk: any) => {
      if (statusIsOk) {
        loadSpace(spaceId)
        onCancelClick()
      }
    })
  }

  const submitClickHandler = () => {
    setMounted(false)
    setDefaultsSet(false)

    switch (action) {
      case NEW_SPACE_PAGE_ACTIONS.EDIT:
        return editClickHandler()
      default:
        return createClickHandler()
    }
  }

  const disableButtons = isSubmitting || info.isFetching || (spaceIsFetching && RESTORE_DATA_ACTIONS.includes(action))

  const { space_type, name, description, host_lead_dxuser, guest_lead_dxuser, sponsor_lead_dxuser } = formData

  const currentUserDxuser = contextUser?.dxuser
  const spaceTypeEditing = !!space?.id && action === NEW_SPACE_PAGE_ACTIONS.EDIT

  var isEditing: boolean | undefined
  if (space_type === SPACE_REVIEW) {
    isEditing = false
  } else if (space_type === SPACE_GROUPS && action === NEW_SPACE_PAGE_ACTIONS.EDIT) {
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

  const disableAction = disableButtons || any((e: any) => isNil(e) || isEmpty(e) || !e?.trim().length)(requiredParams)

  const wrapperMessage = (action === NEW_SPACE_PAGE_ACTIONS.EDIT) ? 'Editing'  : 'Loading'
  if (!mounted) {
    return (
      <LoaderWrapper>
        <h3>{wrapperMessage} space...</h3>
      </LoaderWrapper>
    )
  }

  var allowedTypes = info.allowed_types
  if (space.type && action === NEW_SPACE_PAGE_ACTIONS.EDIT) {
    // @ts-ignore
    allowedTypes = [space.type]
  }

  const typeDisplay = (type: string) => {
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
          {allowedTypes.map((type: any) => (
            <SpaceTypeSwitch
              key={type}
              label={typeDisplay(type)}
              disabled={spaceTypeEditing}
              name="space_type"
              checked={space_type === type}
              value={type}
              onChange={filedChangeHandler}
              aria-label={type + ' radio button'}
              description=""
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
        type="text"
        row={true}
      >
      </TextField>

      <TextareaField
        name="description"
        label="Description (required):"
        placeholder="What is this space about..."
        value={description}
        helpText={errors.description && errors.description[0]}
        status={errors.description && 'error'}
        onChange={filedChangeHandler}
        text=""
      >
      </TextareaField>

      {[SPACE_GROUPS, SPACE_REVIEW].includes(space_type) && (
        <TextField
          name="host_lead_dxuser"
          value={host_lead_dxuser}
          disabled={isEditing}
          label={`${getHostLeadLabel(space_type)} (required):`}
          status={errors.host_lead_dxuser && 'error'}
          helpText={errors.host_lead_dxuser && errors.host_lead_dxuser[0]}
          onChange={filedChangeHandler}
          type="text"
          row={true}
        >
        </TextField>
      )}

      {[SPACE_GROUPS].includes(space_type) && (
        <TextField
          name="guest_lead_dxuser"
          value={guest_lead_dxuser}
          disabled={isEditing}
          label={`${getGuestLeadLabel(space_type)} (required):`}
          status={errors.guest_lead_dxuser && 'error'}
          helpText={errors.guest_lead_dxuser && errors.guest_lead_dxuser[0]}
          onChange={filedChangeHandler}
          type="text"
          row={true}
        >
        </TextField>
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
          type="text"
          row={true}
        >
        </TextField>
      )}

      {space_type === SPACE_REVIEW && (
        <TextField
          name="cts"
          label="Center Tracking System # (optional):"
          status={errors.cts && 'error'}
          helpText={errors.cts && errors.cts[0]}
          onChange={filedChangeHandler}
          type="text"
          row={true}
        >
          <span>
            FDA uses the Center Tracking System (CTS) to track the progress of industry submitted pre-market documents through the
            review process. CTS is a workflow/work management system that provides support for the Center for Devices and
            Radiogical Health (CDRH) business processes and business rules, for all stages of the product lifecycle for medical
            devices.
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
        <Button onClick={onCancelClick} disabled={disableButtons} size="md" className="">
          Cancel
        </Button>
      </div>
    </div>
  )
}

NewSpaceModalFormComponent.defaultProps = {
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

// @ts-ignore
const mapStateToProps = (state: any, { onCancelClick }) => ({
  ...state.spaces.newSpace,
  space: spaceDataSelector(state),
  spaceIsFetching: spaceIsFetchingSelector(state),
  contextUser: contextUserSelector(state),
  onCancelClick,
})

const mapDispatchToProps = (dispatch: any) => ({
  onCreateClick: (params: any) => dispatch(createSpace(params)),
  onEditClick: (params: any, spaceId: any) => dispatch(editSpace(params, spaceId)),
  onMount: () => dispatch(fetchNewSpaceInfo()),
  loadSpace: (spaceId: any) => dispatch(fetchSpace(spaceId)),
  // @ts-ignore
  setLockedPage: () => dispatch(setErrorPage(ERROR_PAGES.LOCKED_SPACE)),
})

export const NewSpaceModalForm = connect(mapStateToProps, mapDispatchToProps)(NewSpaceModalFormComponent)
