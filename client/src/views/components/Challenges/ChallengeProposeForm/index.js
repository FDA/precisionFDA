import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { any, isEmpty, isNil } from 'ramda'

import Button from '../../../components/Button'
import Radio from '../../../components/FormComponents/Radio'
import TextField from '../../../components/FormComponents/TextField'
import TextareaField from '../../../components/FormComponents/TextareaField'
import { proposeChallenge } from '../../../../actions/challenges/proposeChallenge'
import { resetProposeChallengeForm } from '../../../../actions/challenges'
import {
  challengeProposeIsSubmittingSelector,
  challengeProposeSubmissionSuccessSelector,
} from '../../../../reducers/challenges/propose/selectors'
import './style.sass'


// Consider refactoring to use something like Formik
const emailValidator = (email) => {
  if (
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(
      email,
    )
  ) {
    return true
  }
  return false
}


class ChallengeProposeForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      formData: {
        name: '',
        email: '',
        organisation: '',
        specific_question: 'Yes',
        specific_question_text: '',
        data_details: 'Yes',
        data_details_text: '',
      },
      formErrors: {
      },
    }
  }

  componentDidMount() {
    const { resetProposeChallengeForm } = this.props
    resetProposeChallengeForm()
    this.resetState()
  }

  resetState() {
    this.setState({
      formData: {
        name: '',
        email: '',
        organisation: '',
        specific_question: 'Yes',
        specific_question_text: '',
        data_details: 'Yes',
        data_details_text: '',
      },
      formErrors: {
      },
    })
  }

  onChangeHandler = (e) => {
    const { currentTarget } = e
    const formData = {
      ...this.state.formData,
      [currentTarget.name]: (currentTarget.type === 'checkbox') ? currentTarget.checked : currentTarget.value,
    }
    const formErrors = emailValidator(formData.email) ? {} : {
      email: 'Please enter a valid email address',
    }
    this.setState({
      formData: formData,
      formErrors: formErrors,
    })
  }

  validateForm = () => {
    const data = this.state.formData
    const params = [
        data.name,
        data.email,
        data.organisation,
      ]
    if (data.specific_question==='Yes') {
      params.push(data.specific_question_text)
    }
    if (data.data_details==='Yes') {
      params.push(data.data_details_text)
    }

    const missingData = any(e => isNil(e) || isEmpty(e))(params)

    // A quick and dirty validation method just for email
    // since this is a quick feature
    const validEmail = emailValidator(data.email)

    return !missingData && validEmail
  }

  onSubmit = (e) => {
    const { proposeChallenge } = this.props
    e.preventDefault()
    const params = this.state.formData
    // console.log(params)
    proposeChallenge(params)
  }

  render() {
    const { isSubmitting, submissionSuccess } = this.props

    if (submissionSuccess) {
      return (
        <div className="challenge-propose-form-container__success">
          <h3>Thank you</h3>
          <p>Your challenge proposal has been submitted successfully! You will hear from us shortly.</p>
        </div>
      )
    }

    const formIsValid = this.validateForm()
    const formDisabled = isSubmitting || !formIsValid
    
    const scientificQuestionRadioOptions = [
      { 'label': 'Yes', 'value': 'Yes' , 'ariaLabel': 'Select Yes to specific scientific question driving the challenge', 'htmlFor': 'Opt Yes to specific scientific question driving the challenge' },
      { 'label': 'No', 'value': 'No', 'ariaLabel': 'Select No to specific scientific question driving the challenge', 'htmlFor': 'Opt No to specific scientific question driving the challenge' }, 
    ]

    const accessToDataRadioOptions = [
      { 'label': 'Yes', 'value': 'Yes' , 'ariaLabel': 'Select Yes for access to data for the challenge', 'htmlFor': 'Opt Yes to access to data for the challenge' },
      { 'label': 'No', 'value': 'No', 'ariaLabel': 'Select No for access to data for the challenge', 'htmlFor': 'Opt No to access to data for the challenge' },
    ]

    const showErrorString = !formIsValid
    const formErrors = this.state.formErrors
    const errorString = (formErrors && formErrors['email']) ? formErrors['email']
                          : 'Please complete the missing fields to submit this form.'

    return (
      <div className="challenge-propose-form-container">
        <form className="challenge-propose-form">
          <h2 className="pfda-subsection-heading">PRECISIONFDA CHALLENGE INQUIRY</h2>
          <p>Please complete this form for your new challenge proposal. Thank you!</p>

          <TextField type="text" name="name" label="Name" row={true} placeholder="Enter your name"
            onChange={this.onChangeHandler}
            />
          <TextField type="text" name="email" label="Contact Email" row={true} placeholder="Enter your contact email"
            onChange={this.onChangeHandler}
            />
          <TextField type="text" name="organisation" label="Organisation/Institute" row={true} placeholder="Enter your organization/institute"
            onChange={this.onChangeHandler}
            />
          <Radio name="specific_question" label="Do you have specific scientific question driving the challenge?" options={scientificQuestionRadioOptions} initialValue={'Yes'}
            onChange={this.onChangeHandler} />
          <TextareaField name="specific_question_text" label="Please provide details"
            placeholder="Enter question details"
            aria_label="Please provide details for any scientific questions" 
            onChange={this.onChangeHandler}
            disabled={this.state.formData.specific_question==='No'}
          />
          <Radio name="data_details" label="Do you have access to data for the challenge?" options={accessToDataRadioOptions} inline={true} initialValue={'Yes'}
            onChange={this.onChangeHandler} />
          <TextareaField name="data_details_text" label="Please provide details about the data (e.g. data type, sample number, etc)"
            placeholder="Enter data details"
            aria_label="Please provide details about data for the challenge"
            onChange={this.onChangeHandler}
            disabled={this.state.formData.data_details==='No'}
          />
          <div style={{ 'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'padding': 0 }}>
            <div className='missing_data'>
            {showErrorString &&
            (
              <div>{errorString}</div>
            )}
            </div>
            <div>
              <Button type="primary" onClick={this.onSubmit} disabled={formDisabled}>
                {isSubmitting ? 'Submitting…' : 'Submit Inquiry'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

ChallengeProposeForm.propTypes = {
  isSubmitting: PropTypes.bool,
  submissionSuccess: PropTypes.bool,
  proposeChallenge: PropTypes.func,
  resetProposeChallengeForm: PropTypes.func,
}

ChallengeProposeForm.defaultProps = {
  isSubmitting: false,
  submissionSuccess: false,
  proposeChallenge: () => {},
  resetProposeChallengeForm: () => {},
}

const mapStateToProps = (state) => ({
  isSubmitting: challengeProposeIsSubmittingSelector(state),
  submissionSuccess: challengeProposeSubmissionSuccessSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  proposeChallenge: (params) => dispatch(proposeChallenge(params)),
  resetProposeChallengeForm: () => dispatch(resetProposeChallengeForm()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeProposeForm)

export { ChallengeProposeForm }
