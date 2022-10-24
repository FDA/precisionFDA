/* eslint-disable max-classes-per-file */
import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  fetchMyEntries,
} from '../../../../actions/submissions'
import { Table, Thead, Tbody, Th } from '../../TableComponents'
import {
  ISubmissionElementProps,
  IChallengeSubmissionsTableProps,
  renderChallengeSubmissionsTable,
  SubmissionStateCell,
  SubmissionNameCell,
  SubmissionInputFilesCell,
  SubmissionCreatedAtCell,
} from '../ChallengeSubmissionsTable'
import {
  challengeMyEntriesDataSelector,
  challengeMyEntriesIsFetchingSelector,
} from '../../../../reducers/challenges/challenge/selectors'
import { ISubmission } from '../../../../types/submission'


class MyEntryRow extends Component<ISubmissionElementProps> {
  render() {
    const { submission, user } = this.props
    return (
      <tr>
        <SubmissionStateCell submission={submission} />
        <SubmissionNameCell submission={submission} />
        <td><a href={`/challenges/${submission.challengeId}/submissions/${submission.id}/edit`}>Edit</a></td>
        <SubmissionInputFilesCell submission={submission} user={user} />
        <SubmissionCreatedAtCell submission={submission} />
      </tr>
    )
  }
}

class ChallengeMyEntriesTable extends Component<IChallengeSubmissionsTableProps> {
  componentDidMount() {
    const { fetchData, challengeId } = this.props
    fetchData(challengeId)
  }

  renderEmptyView() {
    return (
      <div>
        You have not submitted any entries for this challenge.
      </div>
    )
  }

  renderTable(submissions: ISubmission[], user: any) {
    return (
      <div className="challenge-submissions-table table-responsive">
        <div className="challenge-submissions-table__wrapper">
          <Table>
            <Thead>
              <Th>State</Th>
              <Th>Name</Th>
              <Th></Th>
              <Th>Input File</Th>
              <Th>Created</Th>
            </Thead>
            <Tbody>
              {submissions.map((submission) => (
                <MyEntryRow key={submission.id} submission={submission} user={user} />
              ))}
            </Tbody>
          </Table>
        </div>
      </div>
    )
  }

  render() {
    const { submissions, isFetching, user } = this.props
    return renderChallengeSubmissionsTable(submissions, isFetching, user, false, this.renderEmptyView, this.renderTable)
  }
}

const mapStateToProps = (state: any) => ({
  submissions: challengeMyEntriesDataSelector(state),
  isFetching: challengeMyEntriesIsFetchingSelector(state),
})

const mapDispatchToPropsSubmissions = (dispatch: any) => ({
  fetchData: (challengeId: number) => dispatch(fetchMyEntries(challengeId)),
})

const ConnectedComp = connect(mapStateToProps, mapDispatchToPropsSubmissions)(ChallengeMyEntriesTable)
const WrappedComp = (props: any) => <ConnectedComp {...props} />

export default WrappedComp
