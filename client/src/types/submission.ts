import { IUser } from './user'
import { JobState } from './job'


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
  runInputData: object[],
  userCanAccessSpace: boolean,
}

export type {
  ISubmission,
}
