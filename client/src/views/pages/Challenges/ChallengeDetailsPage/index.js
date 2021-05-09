import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs'
import classNames from 'classnames/bind'
import { format } from 'date-fns-tz'
import enUS from 'date-fns/locale/en-US'

import { fetchChallenge } from '../../../../actions/challenges'
import ChallengeShape from '../../../shapes/ChallengeShape'
import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import Loader from '../../../components/Loader'
import ChallengeTimeRemaining from '../../../components/Challenges/ChallengeTimeRemaining'
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
import ChallengOutline from '../../../components/Challenges/ChallengeOutline'
import ChallengeUserContent from '../../../components/Challenges/ChallengeUserContent'
import ChallengeResults from '../../../components/Challenges/ChallengeResults'
import GuestRestrictedLink from '../../../components/Controls/GuestRestrictedLink'
import { theme } from '../../../../styles/theme'


// Stripping HTML code in case user inserts links in the header
// See https://jira.internal.dnanexus.com/browse/PFDA-2396
//
export const stripHTML = (html) => {
  let doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

// Helper class to analyse the Introduction and Results content of a challenge
//
// The output are:
//   introContent - the challenge description in HTML, with anchors inserted to h1 and h2 links
//   anchors -  a hierarchical list of anchors that can be used to populate the introduction outline
//   resultsContent - Combination of the 'results' and 'results-details' regions
class ChallengeContent {
  constructor() {
    this.anchors = []
    this.introContent = ''
  }

  // challenge.meta contains the body/content of the challenge details
  // This is structured as a dict as such:
  // { 'regions' : {
  //     'intro': "This is the introduction section of a challenge",
  //     'results': "Populated by challenge admin for the results section",
  //     'results-details': "The results area is separated into two sections",
  // }}
  //
  parseChallengeMeta(challenge, isLoggedIn) {
    if (!challenge || !challenge.meta || !challenge.meta.regions) {
      return
    }

    let introContent = challenge.meta.regions['intro'] ? challenge.meta.regions['intro'] : ''

    // In challenges.meta, we extract <h1> and <h2> tags for the introduction section
    // to create href anchors and buttons to navigate to them in the side bar
    //
    const el = document.createElement('html')
    el.innerHTML = introContent

    const headingElements = el.querySelectorAll('h1, h2')

    let anchorId = 0
    const getNextAnchorId = (content) => {
      anchorId += 1
      const maxAnchorIdLength = 20
      let slug = stripHTML(content).replace(/ /g, '_')
      slug = encodeURIComponent(slug.slice(0, maxAnchorIdLength))
      const idTagContent = anchorId.toString() + '__' + slug
      return idTagContent
    }

    const anchors = Array.from(headingElements).map((el) => {
      const tag = el.tagName
      const content = (el.innerHTML ? el.innerHTML.trim() : '')
      const anchorId = getNextAnchorId(content)

      // If user is not logged in, add a hidden anchor element to take the sticky header
      // into account by inserting a hidden anchor to scroll to
      if (isLoggedIn) {
        el.setAttribute('id', anchorId)
      }
      else {
        var hiddenAnchor = document.createElement('section')
        hiddenAnchor.setAttribute('id', anchorId)
        hiddenAnchor.style.position = 'relative'
        hiddenAnchor.style.top = `-${theme.values.navigationBarHeight+theme.values.contentMargin}px`
        hiddenAnchor.style.visibility = 'hidden'
        hiddenAnchor.style.zIndex = '321'
        el.parentElement.insertBefore(hiddenAnchor, el)
      }

      return { 'tag': tag, 'content': stripHTML(content), 'anchorId': anchorId }
    })

    this.anchors = anchors
    this.introContent = el.innerHTML
  }
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

    const challengeContent = new ChallengeContent()
    challengeContent.parseChallengeMeta(challenge, isLoggedIn)

    let stateLabel = 'Previous precisionFDA Challenge'
    switch (challenge.timeStatus) {
      case CHALLENGE_TIME_STATUS.UPCOMING:
        stateLabel = 'Upcoming precisionFDA Challenge'
        break
      case CHALLENGE_TIME_STATUS.CURRENT:
        stateLabel = 'Current precisionFDA Challenge'
        break
    }

    const bannerClasses = classNames('challenge-details-main-container', 'challenge-details-banner', {
      'upcoming': challenge.timeStatus == CHALLENGE_TIME_STATUS.UPCOMING,
      'current': challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT,
      'ended': challenge.timeStatus == CHALLENGE_TIME_STATUS.ENDED,
    })

    const userCanJoin = isLoggedIn && !challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN
    const userCanSubmitEntry =  isLoggedIn && challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN

    const userCanSeeSubmissions = isLoggedIn
    // Results are visible to:
    //  - site admins who are logged on
    //  - or when results are announced
    //  - or when challenge is archived
    const userCanSeeResults = (isLoggedIn && user.can_create_challenges) || challenge.status == CHALLENGE_STATUS.RESULT_ANNOUNCED || challenge.status == CHALLENGE_STATUS.ARCHIVED

    const page = match.params.page
    const tabPages = userCanSeeSubmissions ? ['', '/submissions', '/my_entries', '/results']
                                           : ['', '/results']

    let tabIndex = this.state.tabIndex
    if (tabIndex < 0) {
      const pageRoute = `/${page}`
      tabIndex = tabPages.includes(pageRoute) ? tabPages.indexOf(pageRoute) : 0
    }

    const onSelectTab = (index) => {
      const url = `/challenges/${challenge.id}${tabPages[index]}`
      history.pushState(null, null, url)
      this.setState({ tabIndex: index })
    }

    const joinChallengeButtonTitle = (challenge.timeStatus == CHALLENGE_TIME_STATUS.ENDED)
      ? 'Challenge Ended'
      : challenge.isFollowed
        ? 'You Have Joined This Challenge'
        : (isLoggedIn ? 'Join Challenge' : 'Log In to Join Challenge')

    const joinChallengeButtonClasses = classNames({
      'disabled': !userCanJoin,
    }, 'btn', 'btn-primary', 'challenge-join-button')

    // N.B. it's not enough to specify timeZone to date-fns-tz's format function, as it also
    //      depends on the locale
    //      See https://stackoverflow.com/questions/65416339/how-to-detect-timezone-abbreviation-using-date-fns-tz
    const userTimeZone = (new Intl.DateTimeFormat()).resolvedOptions().timeZone

    document.title = `${challenge.name} - PrecisionFDA Challenge`

    return (
      <PublicLayout>
        <NavigationBar user={user} showLogoOnNavbar={true}>
          <div className={bannerClasses}>
            <div className="left-column">
              <div>
                <Link to={{ pathname: '/challenges' }}>
                  &larr; Back to All Challenges
                </Link>
                <div style={{ 'marginTop': '20px' }}><span className="challenge-state-label">{stateLabel}</span></div>
                <h1 className="challenge-name">{challenge.name}</h1>
                <p className="challenge-description">{challenge.description}</p>
              </div>
              <div className="date-area">
                <div>
                  <div className="challenge-date-label">Starts</div>
                  <div className="challenge-date">{format(challenge.startAt, 'MM/dd/yyyy HH:mm:ss z', { timeZone: userTimeZone, locale: enUS })}</div>
                </div>
                <div>
                  <div className="challenge-date-label">Ends</div>
                  <div className="challenge-date">{format(challenge.endAt, 'MM/dd/yyyy HH:mm:ss z', { timeZone: userTimeZone, locale: enUS })}</div>
                </div>
                <div className="challenge-date-remaining"><ChallengeTimeRemaining challenge={challenge} /></div>
              </div>
            </div>
            <div className="right-column">
              <img className="challenge-thumbnail" src={challenge.cardImageUrl} />
            </div>
          </div>
        </NavigationBar>
        
        <div className="challenge-details-main-container">
          <div className="left-column">
            <Tabs defaultIndex={tabIndex} onSelect={onSelectTab}>
              <TabList className="challenge-details-tabs__tab-list">
                <Tab className="challenge-details-tabs__tab" selectedClassName="challenge-details-tabs__tab--selected">INTRODUCTION</Tab>
                {userCanSeeSubmissions && (
                  <>
                  <Tab className="challenge-details-tabs__tab">SUBMISSIONS</Tab>
                  <Tab className="challenge-details-tabs__tab">MY ENTRIES</Tab>
                  </>
                )}
                {userCanSeeResults && (
                <Tab className="challenge-details-tabs__tab" selectedClassName="challenge-details-tabs__tab--selected">RESULTS</Tab>
                )}
              </TabList>

              <TabPanel>
                <ChallengeUserContent html={challengeContent.introContent} />
              </TabPanel>
              {userCanSeeSubmissions && (
                <>
                <TabPanel>
                  <ChallengeSubmissionsTable challengeId={challenge.id} />
                </TabPanel>
                <TabPanel>
                  <ChallengeMyEntriesTable challengeId={challenge.id} />
                </TabPanel>
                </>
              )}
              {userCanSeeResults && (
              <TabPanel>
                <ChallengeResults challenge={challenge} />
              </TabPanel>
              )}
            </Tabs>
          </div>
          <div className="right-column pfda-main-content-sidebar">
            {user.is_guest ?
              <GuestRestrictedLink to={`/challenges/${challenge.id}/join`} className={joinChallengeButtonClasses}>Join Challenge</GuestRestrictedLink> 
              :
              <button className={joinChallengeButtonClasses} onClick={() => {if (userCanJoin) { this.handleJoinChallenge()}}}>{joinChallengeButtonTitle}</button>
            }
            {userCanSubmitEntry && (
              <a className="btn btn-primary btn-block" style={{ marginTop: '12px' }} href={challenge.links.new_submission}>Submit Challenge Entry</a>
            )}
            {tabIndex == 0 && (
            <>
              <hr style={{ marginTop: '24px' }} />
              <ChallengOutline anchors={challengeContent.anchors} />
            </>
            )}
            {challenge.canEdit && (
            <div className="btn-group" style={{ marginTop: '24px', width: '100%' }}>
              <a className="btn btn-default btn-block" href={`/challenges/${challenge.id}/edit`}><span className="fa fa-cog fa-fw"></span> Settings</a>
              <a className="btn btn-default btn-block" href={`/challenges/${challenge.id}/editor`} data-no-turbolink="true"><span className="fa fa-file-code-o fa-fw"></span> Edit Page</a>
            </div>
            )}
          </div>
        </div>
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
  loadChallenge: () => {},
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
