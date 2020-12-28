import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBarPublic from '../../../components/NavigationBar/NavigationBarPublic'
import ChallengeProposeForm from '../../../components/Challenges/ChallengeProposeForm'
import ChallengesYearList from '../../../components/Challenges/ChallengesYearList'
import CollapsibleMenu from '../../../components/CollapsibleMenu'
import './style.sass'


class ChallengeProposePage extends React.Component {

  render() {
    const { history } = this.props

    const title = 'Challenges'
    const subtitle = 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'
    const sideMenuOptions = [
      {
        text: 'Currently Open',
        onClick: () => history.push('/new_challenges'),
      },
      {
        text: 'Upcoming',
        onClick: () => history.push('/new_challenges'),
      },
      {
        text: 'Propose a Challenge',
        onClick: () => console.log('Propose a Challenge clicked'),
      },
    ]

    return (
      <PublicLayout>
        <NavigationBarPublic title={title} subtitle={subtitle}/>
        
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
            <ChallengesYearList setYearHandler={(year) => {history.push('/new_challenges/?year='+year)}} />
          </div>
        </div>
      </PublicLayout>
    )
  }
}

ChallengeProposePage.propTypes = {
  history: PropTypes.object,
}

ChallengeProposePage.defaultProps = {
}

export {
  ChallengeProposePage,
}

export default withRouter(ChallengeProposePage)
