import PropTypes from 'prop-types'

import UserShape, { mapToUser } from './UserShape'


const SubmissionShape = {
  id: PropTypes.number,
  challengeId: PropTypes.number,
  name: PropTypes.string,
  desc: PropTypes.string,
  createdAt: PropTypes.string,
  updatedAt: PropTypes.string,
  user: PropTypes.exact(UserShape),
  inputs: PropTypes.arrayOf(PropTypes.string),
  jobState: PropTypes.string,
  jobName: PropTypes.string,
  jobInputFiles: PropTypes.arrayOf(PropTypes.object),
  runInputData: PropTypes.arrayOf(PropTypes.object),
  userCanAccessSpace: PropTypes.bool,
}

const mapToSubmission = (data: any) => {
  const user = mapToUser(data.user)
  return {
    id: data.id,
    name: data.name,
    challengeId: data.challenge_id,
    desc: data.desc,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    user: user,
    username: user.name,
    inputs: data.inputs,
    jobState: data.job_state,
    jobName: data.job_name,
    jobInputFiles: data.job_input_files,
    runInputData: data.run_input_data,
    userCanAccessSpace: data.user_can_access_space,
  }
}

export default SubmissionShape

export {
  SubmissionShape,
  mapToSubmission,
}
