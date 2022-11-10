/* eslint-disable react/prefer-stateless-function */
/* eslint-disable max-classes-per-file */
import React, { Component } from 'react'
import { format } from 'date-fns'

import { Link } from 'react-router-dom'
import { IChallenge } from '../../../../types/challenge'
import Button from '../../Button'
import ChallengeTimeRemaining from '../ChallengeTimeRemaining'
import * as Styled from './styles'


interface IChallengeListItem extends IChallenge {
  isFirstItemInSection: boolean,
  sectionHeading: string,
}

interface IChallengeListItemProps {
  challenge: IChallengeListItem,
  userCanJoin: boolean,
  handleItemDetails: (challengeId: number) => void,
}

class ChallengesListItem extends Component<IChallengeListItemProps> {
  render() {
    const { challenge, userCanJoin, handleItemDetails } = this.props
    const userCanEdit = challenge.canEdit

    return (
      <Styled.ChallengeListItem timeStatus={challenge.timeStatus}>
        <Styled.ChallengeListItemThumbnail timeStatus={challenge.timeStatus}>
          {challenge.isFirstItemInSection ? <Styled.ChallengesListSectionHeader timeStatus={challenge.timeStatus}><hr /></Styled.ChallengesListSectionHeader> : ''}
          <img src={challenge.cardImageUrl} alt={`Image representing ${challenge.name}`} onClick={() => handleItemDetails(challenge.id)} />
        </Styled.ChallengeListItemThumbnail>
        <Styled.ChallengeListItemContent>
          {challenge.isFirstItemInSection ? (
            <Styled.ChallengesListSectionHeader timeStatus={challenge.timeStatus}>
              <Styled.SectionHeaderLabel>{challenge.sectionHeading}</Styled.SectionHeaderLabel>
            </Styled.ChallengesListSectionHeader>
          ) : ''}
          <h1 onClick={() => handleItemDetails(challenge.id)}>{challenge.name}</h1>
          <div className='date-area'>
            <span className='challenge-date-label'>Starts</span>
            <span className='challenge-date'>{format(challenge.startAt, 'MM/dd/yyyy')}</span>
            <span style={{ 'marginRight': '8px' }}>&rarr;</span>
            <span className='challenge-date-label'>Ends</span>
            <span className='challenge-date'>{format(challenge.endAt, 'MM/dd/yyyy')} </span>
            <div className='challenge-date-remaining'><ChallengeTimeRemaining challenge={challenge} /></div>
          </div>
          <p>{challenge.description}</p>
          <Button onClick={() => handleItemDetails(challenge.id)}>View Details &rarr;</Button>
          {userCanEdit && (
            <div className="btn-group pull-right">
              <Link data-turbolinks="false" to={`/challenges/${challenge.id}/edit`} title={'edit'} className="btn btn-default">  <span className="fa fa-cog fa-fw"></span> Settings</Link>
              <a className="btn btn-default" data-turbolinks="false" href={challenge.links.editor}><span className="fa fa-file-code-o fa-fw"></span> Edit Page</a>
            </div>
          )}
        </Styled.ChallengeListItemContent>
      </Styled.ChallengeListItem>
    )
  }
}

class ChallengesListItemLanding extends ChallengesListItem {
  render() {
    const { challenge } = this.props
    const { userCanJoin } = this.props
    const { handleItemDetails } = this.props
    const userCanEdit = challenge.canEdit

    return (
      <Styled.ChallengeListItem timeStatus={challenge.timeStatus}>
        <Styled.ChallengeListItemLanding_LeftColumn>
          {challenge.isFirstItemInSection && (
            <>
              <Styled.ChallengesListSectionHeader timeStatus={challenge.timeStatus}><hr /></Styled.ChallengesListSectionHeader>
              <Styled.ChallengesListSectionHeader timeStatus={challenge.timeStatus}>
                <Styled.SectionHeaderLabel_LeftColumn>{challenge.sectionHeading}</Styled.SectionHeaderLabel_LeftColumn>
              </Styled.ChallengesListSectionHeader>
            </>
          )}
        </Styled.ChallengeListItemLanding_LeftColumn>
        <Styled.ChallengeListItemContent>
          <h1 onClick={() => handleItemDetails(challenge.id)}>{challenge.name}</h1>
          <div className='date-area'>
            <span className='challenge-date-label'>Starts</span>
            <span className='challenge-date'>{format(challenge.startAt, 'MM/dd/yyyy')}</span>
            <span style={{ 'marginRight': '8px' }}>&rarr;</span>
            <span className='challenge-date-label'>Ends</span>
            <span className='challenge-date'>{format(challenge.endAt, 'MM/dd/yyyy')} </span>
            <div className='challenge-date-remaining'><ChallengeTimeRemaining challenge={challenge} /></div>
          </div>
          <p>{challenge.description}</p>

          <Button onClick={() => handleItemDetails(challenge.id)}>View Details &rarr;</Button>
          {userCanEdit && (
            <div className="btn-group pull-right">
              <a data-turbolinks="false" className="btn btn-default" href={`/challenges/${challenge.id}/edit`}><span className="fa fa-cog fa-fw"></span> Settings</a>
              <a data-turbolinks="false" className="btn btn-default" href={`/challenges/${challenge.id}/editor`}><span className="fa fa-file-code-o fa-fw"></span> Edit Page</a>
            </div>
          )}
        </Styled.ChallengeListItemContent>
      </Styled.ChallengeListItem>
    )
  }
}

export type {
  IChallengeListItem,
}

export {
  ChallengesListItem,
  ChallengesListItemLanding,
}
