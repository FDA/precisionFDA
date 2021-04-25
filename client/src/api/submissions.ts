import { backendCall } from '../utils/api'


interface ISubmissionParams {
  'challenge_id': number,
}

const getSubmissions = (data: ISubmissionParams) => backendCall('/api/submissions', 'GET', data)
const getMyEntries = (data: ISubmissionParams) => backendCall('/api/submissions/my_entries', 'GET', data)

export {
  getSubmissions,
  getMyEntries
}
