import React from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import ChallengeProposeForm from '../../../components/Challenges/ChallengeProposeForm'
import ChallengesYearList from '../../../components/Challenges/ChallengesYearList'
import CollapsibleMenu from '../../../components/CollapsibleMenu'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import './style.sass'


const ChallengeProposePage = () => {
  const history = useHistory()
  const user = useSelector(contextUserSelector)

  const title = 'Challenges'
  const subtitle = 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'
  const sideMenuOptions = [
    {
      text: 'Currently Open',
      entityType: 'Challenges',
      onClick: () => history.push('/challenges'),
    },
    {
      text: 'Upcoming',
      entityType: 'Challenges',
      onClick: () => history.push('/challenges'),
    },
    {
      text: 'Propose a Challenge',
      entityType: '',
      onClick: () => console.log('Propose a Challenge clicked'),
    },
  ]

  return (
    <PublicLayout>
      <NavigationBar title={title} subtitle={subtitle} user={user} />

      <div className="challenge-propose-main-container">
        <div className="left-column">
          <h1 className="pfda-section-heading">Propose a Challenge</h1>
          <p>Do you have an idea, an objective, a dataset, an algorithm, or any combination of the above that you would like to put in front of the precisionFDA expert community.</p>
          <p>Feel free to let us know! We would love to discuss this with you.</p>
        </div>
        <div className="middle-column">
          <ChallengeProposeForm />
        </div>
        <div className="right-column">
          <CollapsibleMenu title="Challenges" options={sideMenuOptions} />
          <hr />
          <div className="pfda-subsection-heading">PREVIOUS CHALLENGES</div>
          <ChallengesYearList setYearHandler={(year) => {history.push('/challenges/?year='+year)}} />
        </div>
      </div>
    </PublicLayout>
  )
}

ChallengeProposePage.propTypes = {
  history: PropTypes.object,
}

export { ChallengeProposePage }

export default ChallengeProposePage
