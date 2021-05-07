import PropTypes from 'prop-types'

import UserShape, { mapToUser } from './UserShape'


// fixme: Once PFDA-2301 is merged, move the following type definitions to its dedicated path
//        in the meantime, JobShape and UserShape are not in Typescript
interface IUser {
  id: number,
  name: string,
  org: string,
  url: string,
  isAccepted: boolean,
  dxuser: string,
}

enum JobState {
  Done = "done",
  Failed = "failed",
  Idle = "idle",
  Running = "running",
  Terminated = "terminated",
  Terminating = "terminating",
}

interface ISubmission {
  id: number,
  challengeId: number,
  name: string,
  desc: string,
  createdAt: string,
  updatedAt: string,
  user: IUser,
  username: string,
  inputs: string[],
  jobState: JobState,
  jobName: string,
  jobInputFiles: object[],
  userCanAccessSpace: boolean,
}

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
    userCanAccessSpace: data.user_can_access_space,
  }
}

export default SubmissionShape

export type {
  IUser,
  ISubmission,
}

export {
  JobState,
  SubmissionShape,
  mapToSubmission,
}
