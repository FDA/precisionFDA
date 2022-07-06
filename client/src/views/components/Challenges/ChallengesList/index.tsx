import React, { FunctionComponent, useEffect } from 'react'
import { useSelector } from 'react-redux'

import history from '../../../../utils/history'
import Pagination from '../../TableComponents/Pagination'
import Loader from '../../Loader'
import { ChallengesListItem, IChallengeListItem } from '../ChallengesListItem'
import { IChallenge } from '../../../../types/challenge'
import {
  challengesListSelector,
  challengesListIsFetchingSelector,
  challengesListPaginationSelector,
} from '../../../../reducers/challenges/list/selectors'
import { CHALLENGE_STATUS, CHALLENGE_TIME_STATUS } from '../../../../constants'
import { StyledChallengesListContainer } from './styles'


interface IChallengesListProps {
  listItemComponent?: typeof ChallengesListItem,
  filter: ((challenges: IChallengeListItem[]) => IChallengeListItem[]) | undefined,
  setPageHandler?: (page: number) => void,
  allowPagination?: boolean,
  emptyListMessage?: string,
}

/**
 * Reorders the response to put all current challenges in front, then upcoming sorted by nearest first, then previous
 * @param challenges
 * @returns reordered challenges list by custom rules
 */
const reoderChallenges = (challenges: IChallengeListItem[]): IChallengeListItem[] => {

  const currentChallenges: IChallengeListItem[] = []
  const upcomingChallenges: IChallengeListItem[] = []
  const rest: IChallengeListItem[] = []

  challenges.forEach((challenge) => {
    switch (challenge.timeStatus) {
    case CHALLENGE_TIME_STATUS.CURRENT:
      currentChallenges.push(challenge); break
    case CHALLENGE_TIME_STATUS.UPCOMING:
      upcomingChallenges.push(challenge); break
    default:
      rest.push(challenge); break
    }
  })
  upcomingChallenges.sort((a, b ) => a.startAt.getTime() - b.startAt.getTime());

  return [...currentChallenges, ...upcomingChallenges, ...rest]
}


const ChallengesList: FunctionComponent<IChallengesListProps> = ({ listItemComponent=ChallengesListItem, filter=undefined, allowPagination=true, setPageHandler=undefined, emptyListMessage }) => {

  const challenges = useSelector(challengesListSelector)
  const isFetching = useSelector(challengesListIsFetchingSelector)
  const pagination = useSelector(challengesListPaginationSelector)

  if (isFetching) {
    return (
      <div className='text-center' style={{ margin: '32px' }}>
        <Loader />
      </div>
    )
  }

  let challengesToShow = challenges as IChallengeListItem[]
  if (challengesToShow && filter) {
    challengesToShow = filter(challengesToShow)
  }

  if (!challengesToShow || challengesToShow.length == 0) {
    return <div className='text-center' style={{ margin: '32px' }}>{emptyListMessage ? emptyListMessage : 'No challenges found.'}</div>
  }

  // Do some property injection to determine the first of different sections
  //
  //   if challenge.isFirstItemInSection = true , insers a header before the list item to
  //   denote the section header, using the challenge.sectionHeading attribute
  //
  let foundFirstUpcomingChallenge = false
  let foundFirstCurrentChallenge = false
  let foundFirstClosedChallenge = false

  challengesToShow = reoderChallenges(challengesToShow)

  challengesToShow.map((challenge) => {
    if (!foundFirstUpcomingChallenge && challenge.timeStatus == CHALLENGE_TIME_STATUS.UPCOMING) {
      challenge.isFirstItemInSection = true
      challenge.sectionHeading = 'Upcoming Challenges'
      foundFirstUpcomingChallenge = true
    }
    else if (!foundFirstCurrentChallenge && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT) {
      challenge.isFirstItemInSection = true
      challenge.sectionHeading = 'Current Challenges'
      foundFirstCurrentChallenge = true
    }
    else if (!foundFirstClosedChallenge && challenge.timeStatus == CHALLENGE_TIME_STATUS.ENDED) {
      challenge.isFirstItemInSection = true
      challenge.sectionHeading = 'Previous Challenges'
      foundFirstClosedChallenge = true
    }
    else {
      challenge.isFirstItemInSection = false
    }
  })

  const handleItemDetails = (id: number) => {
    history.push(`/challenges/${id}`)
  }

  const handleJoinChallenge = (id: number) => {
    window.location.assign(`/challenges/${id}/join`)
  }

  const canUserJoin = (challenge: IChallenge) => !challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN
  const ListItem = listItemComponent

  return (
    <StyledChallengesListContainer>
      <ul className="challenges-list">
        {challengesToShow.map((challenge) => <ListItem key={challenge.id} challenge={challenge} handleItemDetails={handleItemDetails} userCanJoin={canUserJoin(challenge)} />, this)}
      </ul>
      {allowPagination &&
        <Pagination data={pagination} setPageHandler={setPageHandler} />
      }
    </StyledChallengesListContainer>
  )
}


export default ChallengesList

export {
  ChallengesList,
}
