import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs'
import classNames from 'classnames/bind'

import { fetchChallenge } from '../../../../actions/challenges'
import ChallengeShape from '../../../shapes/ChallengeShape'
import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import Loader from '../../../components/Loader'
import './style.sass'
import {
  challengeDataSelector,
  challengeErrorSelector,
  challengeIsFetchingSelector,
} from '../../../../reducers/challenges/challenge/selectors'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { CHALLENGE_STATUS, CHALLENGE_TIME_STATUS } from '../../../../constants'
import ChallengeSubmissionsTable from '../../../components/Challenges/ChallengeSubmissionsTable'
import ChallengeMyEntriesTable from '../../../components/Challenges/ChallengeMyEntriesTable'
import GuestRestrictedLink from '../../../components/Controls/GuestRestrictedLink'
import { CallToActionButton, StyledPageContainer } from './styles'
import UserContent from '../../../components/UserContent'
import { ChallengeDetailsBanner } from './ChallengeDetailsBanner'
import { PageRightColumn, PageLeftColumn } from '../../../../components/Page/styles'


const extractChallengeContent = (challenge, regionName) => {
  if (!challenge?.meta?.regions?.[regionName]) {
    return ''
  }
  return challenge.meta.regions[regionName]
}


class ChallengeDetailsPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = { tabIndex: -1 }
  }

  componentDidMount() {
    const { match, loadChallenge } = this.props
    if (match && match.params) {
      loadChallenge(parseInt(match.params.challengeId))
    }
  }

  handleJoinChallenge = () => {
    const { challenge } = this.props
    if (challenge.isFollowed) {
      return
    }
    // this.props.history.push(`/challenges/${challengeId}/join`)
    window.location.assign(`/challenges/${challenge.id}/join`)
  }

  render() {
    const { match, isFetching, user, challenge, error } = this.props

    if (isFetching) {
      return (
        <PublicLayout>
          <div className="text-center">
            <Loader />
          </div>
        </PublicLayout>
      )
    }

    if (error) {
      return (
        <PublicLayout>
          <NavigationBar showLogoOnNavbar={true} />
          <div className="error-container">
            <Link to={{ pathname: '/challenges' }}>
              &larr; Back to All Challenges
            </Link>
            <div className="text-center">
              {error}
            </div>
          </div>
        </PublicLayout>
      )
    }

    const isLoggedIn = user && Object.keys(user).length > 0

    const challengePreRegistration = challenge.status == CHALLENGE_STATUS.PRE_REGISTRATION
    const challengeSetupOrPreRegistration = (challenge.status == CHALLENGE_STATUS.SETUP) || challengePreRegistration

    const userCanJoin = isLoggedIn && !challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN
    const userCanSubmitEntry = isLoggedIn && challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN
    const userIsChallengeAdmin = (isLoggedIn && user.can_create_challenges)

    const userCanSeePreRegistration = challengePreRegistration || (userIsChallengeAdmin && challengeSetupOrPreRegistration)

    // Introduction is visible to:
    //  - everyone when a challenge is not in pre-registration phase
    //  - challenge admins in all phases of a challenge
    const userCanSeeIntroduction = !challengePreRegistration || userIsChallengeAdmin

    // Submissions are visible to:
    //  - any logged in users when challenge is not in setup or pre-registration phase
    const userCanSeeSubmissions = isLoggedIn && !challengeSetupOrPreRegistration

    // Results are visible to:
    //  - challenge admins
    //  - everyone when results are announced or challenge is archived
    const userCanSeeResults = userIsChallengeAdmin
                              || challenge.status == CHALLENGE_STATUS.RESULT_ANNOUNCED
                              || challenge.status == CHALLENGE_STATUS.ARCHIVED

    const tabs = []

    if (userCanSeePreRegistration) {
      const preRegistrationContent = extractChallengeContent(challenge, 'pre-registration')
      const userContent = new UserContent(preRegistrationContent, isLoggedIn)

      tabs.push({
        title: 'PRE-REGISTRATION',
        subroute: '',
        content: userContent.createDisplayElement(),
        outline: userContent.createOutlineElement(),
      })
    }

    if (userCanSeeIntroduction) {
      const introductionContent = extractChallengeContent(challenge, 'intro')
      const userContent = new UserContent(introductionContent, isLoggedIn)
      tabs.push({
        title: 'INTRODUCTION',
        subroute: '',
        content: userContent.createDisplayElement(),
        outline: userContent.createOutlineElement(),
      })
    }

    if (userCanSeeSubmissions) {
      tabs.push({
        title: 'SUBMISSIONS',
        subroute: '/submissions',
        content: (<ChallengeSubmissionsTable challengeId={challenge.id} isSpaceMember={challenge.isSpaceMember} />),
      })
      tabs.push({
        title: 'MY ENTRIES',
        subroute: '/my_entries',
        content: (<ChallengeMyEntriesTable challengeId={challenge.id} />),
      })
    }

    if (userCanSeeResults) {
      const resultsContent = extractChallengeContent(challenge, 'results') + extractChallengeContent(challenge, 'results-details')
      const userContent = new UserContent(resultsContent, isLoggedIn)
      tabs.push({
        title: 'RESULTS',
        subroute: '/results',
        content: userContent.createDisplayElement(),
        outline: userContent.createOutlineElement(),
      })
    }

    const tabSubroutes = tabs.map(x => x['subroute'])

    let tabIndex = this.state.tabIndex
    if (tabIndex < 0) {
      const page = match.params.page
      const pageRoute = `/${page}`
      tabIndex = tabSubroutes.includes(pageRoute) ? tabSubroutes.indexOf(pageRoute) : 0
    }

    const currentTab = tabs[tabIndex]

    const onSelectTab = (index) => {
      const url = `/challenges/${challenge.id}${tabSubroutes[index]}`
      history.pushState(null, null, url)
      this.setState({ tabIndex: index })
    }

    const onClickPreRegistrationButton = () => {
      if (challenge.preRegistrationUrl) {
        window.open(challenge.preRegistrationUrl, '_blank').focus()
      }
    }

    const joinChallengeButtonTitle = (challenge.timeStatus == CHALLENGE_TIME_STATUS.ENDED)
      ? 'Challenge Ended'
      : challenge.isFollowed
        ? 'You Have Joined This Challenge'
        : (isLoggedIn ? 'Join Challenge' : 'Log In to Join Challenge')

    const joinChallengeButtonClasses = classNames({
      'disabled': !userCanJoin,
    }, 'btn', 'btn-primary', 'challenge-join-button')

    document.title = `${challenge.name} - PrecisionFDA Challenge`

    return (
      <PublicLayout>
        <NavigationBar user={user} showLogoOnNavbar={true}>
          <ChallengeDetailsBanner challenge={challenge} />
        </NavigationBar>
        
        <StyledPageContainer>
          <PageLeftColumn>
            <Tabs defaultIndex={tabIndex} onSelect={onSelectTab}>
              <TabList className="challenge-details-tabs__tab-list">
                {tabs.map((tab, index) => (
                  <Tab key={index} className="challenge-details-tabs__tab" selectedClassName="challenge-details-tabs__tab--selected">{tab.title}</Tab>
                ))}
              </TabList>

              {tabs.map((tab, index) => (
                <TabPanel key={index}>
                  {tab.content}
                </TabPanel>
              ))}
            </Tabs>
          </PageLeftColumn>
          <PageRightColumn>
            {challengePreRegistration ?
              <CallToActionButton onClick={onClickPreRegistrationButton}>Sign Up for Pre-Registration</CallToActionButton>
              :
              user.is_guest ?
                <GuestRestrictedLink to={`/challenges/${challenge.id}/join`} className={joinChallengeButtonClasses}>Join Challenge</GuestRestrictedLink>
                :
                <button className={joinChallengeButtonClasses} onClick={() => { if (userCanJoin) { this.handleJoinChallenge() } }}>{joinChallengeButtonTitle}</button>
            }
            {userCanSubmitEntry && (
              <a className="btn btn-primary btn-block" style={{ marginTop: '12px' }} href={challenge.links.new_submission}>Submit Challenge Entry</a>
            )}
            {currentTab && (
            <>
              <hr style={{ marginTop: '24px' }} />
              {currentTab.outline}
            </>
            )}
            {challenge.canEdit && (
            <div className="btn-group" style={{ marginTop: '24px', width: '100%' }}>
              <a className="btn btn-default btn-block" href={`/challenges/${challenge.id}/edit`}><span className="fa fa-cog fa-fw"></span> Settings</a>
              <a className="btn btn-default btn-block" href={`/challenges/${challenge.id}/editor`} data-no-turbolink="true"><span className="fa fa-file-code-o fa-fw"></span> Edit Page</a>
            </div>
            )}
          </PageRightColumn>
        </StyledPageContainer>
      </PublicLayout>
    )
  }
}

ChallengeDetailsPage.propTypes = {
  isFetching: PropTypes.bool,
  match: PropTypes.shape({
    params: PropTypes.shape({
      challengeId: PropTypes.string.isRequired,
      page: PropTypes.string,
    }),
  }),
  challenge: PropTypes.shape(ChallengeShape),
  history: PropTypes.object,
  error: PropTypes.string,
  user: PropTypes.object,
  loadChallenge: PropTypes.func,
}

ChallengeDetailsPage.defaultProps = {
  challenge: {},
  isFetching: true,
  loadChallenge: () => { },
}

const mapStateToProps = (state) => ({
  challenge: challengeDataSelector(state),
  isFetching: challengeIsFetchingSelector(state),
  error: challengeErrorSelector(state),
  user: contextUserSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadChallenge: (challengeId) => dispatch(fetchChallenge(challengeId)),
})

export {
  ChallengeDetailsPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ChallengeDetailsPage))
