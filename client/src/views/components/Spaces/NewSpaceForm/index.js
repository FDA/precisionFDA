import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { any, isEmpty, isNil } from 'ramda'

import SpaceShape from '../../../shapes/SpaceShape'
import { spaceDataSelector, spaceIsFetchingSelector } from '../../../../reducers/spaces/space/selectors'
import Button from '../../Button'
import { createSpace, editSpace, fetchNewSpaceInfo, fetchSpace } from '../../../../actions/spaces'
import TextField from '../../FormComponents/TextField'
import TextareaField from '../../FormComponents/TextareaField'
import SpaceTypeSwitch from '../SpaceTypeSwitch'
import SubmitButton from './SubmitButton'
import './style.sass'
import {
  SPACE_GROUPS,
  SPACE_REVIEW,
  SPACE_VERIFICATION,
  NEW_SPACE_PAGE_ACTIONS, ERROR_PAGES, SPACE_STATUS_LOCKED,
} from '../../../../constants'
import { LoaderWrapper } from '../../LoaderWrapper'
import { setErrorPage } from '../../ErrorWrapper/actions'


const RESTORE_DATA_ACTIONS = Object.keys(NEW_SPACE_PAGE_ACTIONS)

class NewSpaceForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mounted: false,
      defaultsSet: false,
      formData: {
        space_type: '',
        name: '',
        description: '',
        host_lead_dxuser: '',
        guest_lead_dxuser: '',
        sponsor_lead_dxuser: '',
        source_space_id: null,
        cts: '',
      },
    }
  }

  componentDidMount() {
    const { onMount, loadSpace, action, match } = this.props

    onMount().then(() => {
      if (RESTORE_DATA_ACTIONS.includes(action)) {
        loadSpace(match.params.spaceId).then(() => {
          if (this.props.space.sharedSpaceId) {
            loadSpace(this.props.space.sharedSpaceId).then(() => {
              this.setState({ mounted: true })
            })
          } else {
            this.setState({ mounted: true })
          }
        })
      } else {
        this.setState({ mounted: true })
      }
    })
  }

  componentDidUpdate() {
    const { mounted, defaultsSet, formData } = this.state
    const { info, action, space } = this.props

    if (mounted && RESTORE_DATA_ACTIONS.includes(action) && this.props.space?.status === SPACE_STATUS_LOCKED) {
      this.props.setLockedPage()
    }

    if (mounted && !defaultsSet) {
      this.setState({
        defaultsSet: true,
        formData: {
          ...formData,
          space_type: info.allowed_types.includes(SPACE_REVIEW) ? SPACE_REVIEW : info.allowed_types[0],
        },
      })

      if (RESTORE_DATA_ACTIONS.includes(action)) {
        this.setState({
          formData: {
            space_type: space.type,
            name: space.name,
            description: space.desc,
            host_lead_dxuser: space.hostLead?.dxuser,
            guest_lead_dxuser: space.guestLead?.dxuser,
            sponsor_lead_dxuser: space.guestLead?.dxuser,
            source_space_id: space.id,
            cts: space.cts,
          },
        })
      }
    }
  }

  componentWillUnmount() {
    this.setState({
      mounted: false,
      defaultsSet: false,
    })
  }

  filedChangeHandler = (e) => {
    const { currentTarget } = e
    this.setState({
      formData: {
        ...this.state.formData,
        [currentTarget.name]: currentTarget.type === 'checkbox' ? currentTarget.checked : currentTarget.value,
      },
    })
  }

  createClickHandler = () => {
    this.props.onCreateClick(this.state.formData)
  }

  editClickHandler = () => {
    const { name, description, cts } = this.state.formData
    const { onEditClick, loadSpace, match } = this.props
    const { spaceId } = match.params

    onEditClick({ name, description, cts }, spaceId).then((statusIsOk) => {
      if (statusIsOk) loadSpace(spaceId)
    })
  }

  submitClickHandler = () => {
    const { action } = this.props
    switch (action) {
      case NEW_SPACE_PAGE_ACTIONS.EDIT:
        return this.editClickHandler()
      default:
        return this.createClickHandler()
    }
  }

  render() {
    const { space, errors, isSubmitting, info, onCancelClick, spaceIsFetching, action } = this.props
    const disableButtons = isSubmitting || info.isFetching || (spaceIsFetching && RESTORE_DATA_ACTIONS.includes(action))
    const { space_type, name, description, host_lead_dxuser, guest_lead_dxuser, sponsor_lead_dxuser } = this.state.formData
    const requiredParams = [space_type, name, description, host_lead_dxuser]
    const isEditing = !!space?.id

    if (space_type === SPACE_REVIEW) {
      requiredParams.push(sponsor_lead_dxuser)
    } else if (space_type === SPACE_GROUPS) {
      requiredParams.push(guest_lead_dxuser)
    }

    const disableAction = disableButtons || any(e => isNil(e) || isEmpty(e) || !e?.trim().length)(requiredParams)

    if (!this.state.mounted) {
      return (<LoaderWrapper><span>Loading space...</span></LoaderWrapper>)
    }

    const allowedTypes = isEditing ? [space.type] : info.allowed_types

    return (
      <div className="form new-space-form">
        <div className="form-group">
          <label className="control-label">Space type:</label>
          <div className="space-type-container">
            {allowedTypes.map((type) => (
              <SpaceTypeSwitch
                key={type}
                label={type}
                disabled={isEditing}
                name="space_type"
                checked={space_type === type}
                value={type}
                onChange={this.filedChangeHandler}
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
          onChange={this.filedChangeHandler}
        />

        <TextareaField
          name="description"
          label="Description (required):"
          placeholder="What is this space about..."
          value={description}
          helpText={errors.description && errors.description[0]}
          status={errors.description && 'error'}
          onChange={this.filedChangeHandler}
        />

        <TextField
          name="host_lead_dxuser"
          value={host_lead_dxuser}
          disabled={isEditing}
          label={`${space_type === SPACE_REVIEW ? 'Reviewer' : 'Host'} Lead (required):`}
          status={errors.host_lead_dxuser && 'error'}
          helpText={errors.host_lead_dxuser && errors.host_lead_dxuser[0]}
          onChange={this.filedChangeHandler}
        />

        {
          [SPACE_VERIFICATION, SPACE_GROUPS].includes(space_type) &&
          <TextField
            name="guest_lead_dxuser"
            value={guest_lead_dxuser}
            disabled={isEditing}
            label={`Space Lead (${space_type === SPACE_GROUPS ? 'required' : 'optional'}):`}
            status={errors.guest_lead_dxuser && 'error'}
            helpText={errors.guest_lead_dxuser && errors.guest_lead_dxuser[0]}
            onChange={this.filedChangeHandler}
          />
        }

        { space_type === SPACE_REVIEW &&
          <TextField
            name="sponsor_lead_dxuser"
            value={sponsor_lead_dxuser}
            disabled={isEditing}
            label="Sponsor Lead (required):"
            status={errors.sponsor_lead_dxuser && 'error'}
            helpText={errors.sponsor_lead_dxuser && errors.sponsor_lead_dxuser[0]}
            onChange={this.filedChangeHandler}
          />
        }

        <TextField
          name="cts"
          label="Center Tracking System # (optional):"
          status={errors.cts && 'error'}
          helpText={errors.cts && errors.cts[0]}
          onChange={this.filedChangeHandler}
        >
          <span>
            FDA uses the Center Tracking System (CTS) to track the progress of industry submitted
            pre-market documents through the review process. CTS is a workflow/work management
            system that provides support for the Center for Devices and Radiogical Health (CDRH)
            business processes and business rules, for all stages of the product lifecycle
            for medical devices.
          </span>
        </TextField>

        <div className="form-group">
          <SubmitButton
            action={action}
            submitClickHandler={this.submitClickHandler}
            disabled={disableAction}
            isSubmitting={isSubmitting}
          />
          <Button onClick={onCancelClick} disabled={disableButtons}>Cancel</Button>
        </div>
      </div>
    )
  }
}

NewSpaceForm.propTypes = {
  space: PropTypes.shape(SpaceShape),
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
  match: PropTypes.any,
  setLockedPage: PropTypes.func,
}

NewSpaceForm.defaultProps = {
  isSubmitting: false,
  spaceIsFetching: false,
  info: {
    allowed_types: [],
    isFetching: false,
  },
  errors: {},
  onMount: () => Promise.resolve(),
  loadSpace: () => { },
}

const mapStateToProps = (state, { onCancelClick }) => ({
  ...state.spaces.newSpace,
  space: spaceDataSelector(state),
  spaceIsFetching: spaceIsFetchingSelector(state),
  onCancelClick,
})

const mapDispatchToProps = (dispatch) => ({
  onCreateClick: (params) => dispatch(createSpace(params)),
  onEditClick: (params, spaceId) => dispatch(editSpace(params, spaceId)),
  onMount: () => dispatch(fetchNewSpaceInfo()),
  loadSpace: (spaceId) => dispatch(fetchSpace(spaceId)),
  setLockedPage: () => dispatch(setErrorPage(ERROR_PAGES.LOCKED_SPACE)),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewSpaceForm))

export { NewSpaceForm }
