import React, { Component, FunctionComponent } from 'react'
import { connect } from 'react-redux'
import Loader from '../../Loader'
import Modal from '../../Modal'
import Button from '../../Button'
import {
  fetchSubmissions,
} from '../../../../actions/submissions'
import {
  challengeSubmissionsDataSelector,
  challengeSubmissionsIsFetchingSelector,
} from '../../../../reducers/challenges/challenge/selectors'
import { Table, Thead, Tbody, Th } from '../../TableComponents'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import './style.sass'
import { getOrder } from '../../../../helpers'
import * as C from '../../../../constants'
import { JobState } from '../../../../types/job'
import { ISubmission } from '../../../../types/submission'
import { Markdown } from '../../../../components/Markdown'


interface IChallengeSubmissionsTableProps {
  challengeId: number,
  submissions: ISubmission[],
  isSpaceMember: boolean,
  isFetching: boolean,
  user: any,
  fetchData: (challengeId: number) => void,
}

interface ISubmissionElementProps {
  submission: ISubmission,
  isSpaceMember?: boolean
  user?: any,
}


const renderChallengeSubmissionsTable = (submissions: ISubmission[],
  isFetching: boolean,
  user: any,
  isSpaceMember: boolean,
  renderEmptyView: () => JSX.Element,
  renderTable: (submissions: ISubmission[], user: any, isSpaceMember: boolean) => JSX.Element) => {

  const isLoggedIn = (user && Object.keys(user).length > 0)
  if (!isLoggedIn) {
    return (
      <div className='text-center'>
        In order to participate in this challenge, please <a href="/login">login</a>.
        If you don't have a PrecisionFDA account, please <a href="/request_access">submit an access request</a> to join and engage in the community!
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (!submissions || submissions.length == 0) {
    return renderEmptyView()
  }

  return renderTable(submissions, user, isSpaceMember)
}


const SubmissionStateCell: FunctionComponent<ISubmissionElementProps> = ({ submission }: ISubmissionElementProps) => {
  let state = '', style = ''
  switch (submission.jobState) {
    case JobState.Done:
    case JobState.Failed:
      state = submission.jobState
      style = submission.jobState
      break
    case JobState.Running:
      state = "verifying..."
      style = "running"
      break
    default:
      state = "pending verification..."
      style = "running"
  }
  return <td className={`col-state state-${style}`}>{state}</td>
}

const SubmissionNameCell: FunctionComponent<ISubmissionElementProps> = ({ submission }: ISubmissionElementProps) => {
  const [state, setState] = React.useState({
    isOpen: false,
  })

  const openModal = () => { setState({ isOpen: true }) }
  const closeModal = () => { setState({ isOpen: false }) }

  return (<td className="name">
    <a onClick={openModal}>{submission.jobName}</a>
    <Modal
      isOpen={state.isOpen}
      isLoading={false}
      title={submission.name}
      modalFooterContent={<Button onClick={closeModal}>Close</Button>}
      hideModalHandler={closeModal}
    >
      <Markdown data={submission.desc} />
    </Modal>
  </td>)
}

const SubmissionInputFilesCell: FunctionComponent<ISubmissionElementProps> = ({ submission, user, isSpaceMember }: ISubmissionElementProps) => {

  const userCanAccessFile = (file: any) => {
    const fileIsPublic = (file.scope === 'public')
    const userIsOwnerOfFile = (file.user_id == user.id)
    return !user.is_guest && (fileIsPublic || userIsOwnerOfFile || isSpaceMember)
  }

  const generateAppropriateLink = (file: any) => {
    if (isSpaceMember) {
      const space_file: any = submission.runInputData.filter((v: any) => v.file_name === file.name)?.[0]
      return space_file ? `/home/files/${space_file?.file_uid}` : `/home/files/${file.uid}`
    }
    else {
      return `/home/files/${file.uid}`
    } 
  }


  return (
    <td>
      <ul className="submission-ul">
        {submission.jobInputFiles.map((file: any, index: number) => {
          if (userCanAccessFile(file)) {
            return <li key={file.id}><a href={generateAppropriateLink(file)} target="_blank">{file.name}</a></li>
          }
          return <li key={file.id}>{file.name}</li>
        })}
      </ul>
    </td>
  )
}

const SubmissionCreatedAtCell: FunctionComponent<ISubmissionElementProps> = ({ submission }: ISubmissionElementProps) => {
  return <td>{submission.createdAt}</td>
}

class SubmissionRow extends Component<ISubmissionElementProps> {
  render() {
    const { submission, user, isSpaceMember } = this.props
    return (
      <tr>
        <SubmissionNameCell submission={submission} />
        <td><a href={`/users/${submission.user.dxuser}`}>{submission.user.name}</a></td>
        <SubmissionInputFilesCell submission={submission} user={user} isSpaceMember={isSpaceMember} />
        <SubmissionCreatedAtCell submission={submission} />
      </tr>
    )
  }
}

interface IChallengeSubmissionsTableState {
  sortType: string | null,
  sortDirection: string | null,
}

class ChallengeSubmissionsTable extends Component<IChallengeSubmissionsTableProps, IChallengeSubmissionsTableState> {
  constructor(props: IChallengeSubmissionsTableProps) {
    super(props)
    this.state = {
      sortType: null,
      sortDirection: C.SORT_ASC,
    }
  }

  componentDidMount() {
    const { fetchData, challengeId } = this.props
    fetchData(challengeId)
  }

  renderEmptyView() {
    return (
      <div className="text-center">
        No entries have been successfully submitted for this challenge.
      </div>
    )
  }

  renderTable(submissions: ISubmission[], user: any, isSpaceMember: boolean) {
    const { sortType, sortDirection } = this.state

    const sortTableHandler = (newType: string) => {
      const { type, direction } = getOrder(sortType, newType, sortDirection)
      this.setState({
        sortType: type,
        sortDirection: direction,
      })
    }

    let sortedSubmissions = submissions
    if (sortType) {
      sortedSubmissions = [...submissions].sort((a: any, b: any) => {
        const directionMultiplier = (sortDirection == C.SORT_DESC) ? -1 : 1
        return (a[sortType] < b[sortType] ? -1 : 1) * directionMultiplier
      })
    }

    return (
      <div className="challenge-submissions-table">
        <div className="challenge-submissions-table__wrapper">
          <Table>
            <Thead>
              <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortTableHandler} type='name'>Name</Th>
              <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortTableHandler} type='username'>Submitted by</Th>
              <Th>Input File</Th>
              <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortTableHandler} type='created_at'>Created</Th>
            </Thead>
            <Tbody>
              {sortedSubmissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} user={user} isSpaceMember={isSpaceMember} />
              ))}
            </Tbody>
          </Table>
        </div>
      </div>
    )
  }

  render() {
    const { submissions, isFetching, user, isSpaceMember } = this.props
    return renderChallengeSubmissionsTable(submissions, isFetching, user, isSpaceMember, this.renderEmptyView.bind(this), this.renderTable.bind(this))
  }
}


const mapStateToProps = (state: any) => ({
  submissions: challengeSubmissionsDataSelector(state),
  isFetching: challengeSubmissionsIsFetchingSelector(state),
  user: contextUserSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  fetchData: (challengeId: number) => dispatch(fetchSubmissions(challengeId)),
})

export type {
  IChallengeSubmissionsTableProps,
  ISubmissionElementProps,
}

export {
  SubmissionStateCell,
  SubmissionNameCell,
  SubmissionInputFilesCell,
  SubmissionCreatedAtCell,
  ChallengeSubmissionsTable,
  renderChallengeSubmissionsTable,
}

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeSubmissionsTable)
