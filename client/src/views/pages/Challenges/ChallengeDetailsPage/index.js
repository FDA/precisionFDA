import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs'
import classNames from 'classnames/bind'
import { format } from 'date-fns-tz'
import enUS from 'date-fns/locale/en-US'

import { fetchChallenge } from '../../../../actions/challenges'
import ChallengeShape from '../../../shapes/ChallengeShape'
import PublicLayout from '../../../layouts/PublicLayout'
import NavigationBarPublic from '../../../components/NavigationBar/NavigationBarPublic'
import Loader from '../../../components/Loader'
import CollapsibleMenu from '../../../components/CollapsibleMenu'
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


class ChallengeContent {
  constructor(challenge) {
    this.challenge = challenge
    this.content = ''
    this.anchors = []
    this.parseChallengeMeta(challenge)
  }

  // challenge.meta contains the body/content of the challenge details
  // This is structured as a dict as such:
  // { 'regions' : {
  //     'intro': "This is the introduction section of a challenge",
  //     'results': "Populated by challenge admin for the results section",
  //     'results-details': "The results area is separated into two sections",
  // }}
  //
  parseChallengeMeta = (challenge) => {
    if (challenge == undefined || challenge.meta == undefined || challenge.meta.regions == undefined) {
      return
    }

    let introContent = ''
    let resultsContent = ''

    Object.keys(challenge.meta.regions).forEach(function(key) {
      const value = challenge.meta.regions[key]
      if (key === 'intro') {
        introContent = value
      }
      else if (key.startsWith('results')) {
        resultsContent += value
      }
      else {
        console.error(`Unexpected key ${key} found in challenge.meta. Challenge = `+challenge)
      }
    })

    // In challenges.meta, we extract <h1> and <h2> tags for the introduction section
    // to create href anchors and buttons to navigate to them in the side bar
    //
    const el = document.createElement('html')
    el.innerHTML = introContent

    const headingElements = el.querySelectorAll('h1, h2')

    let anchorId = 0
    const getNextAnchorId = () => {
      anchorId += 1
      return 'anchor'+anchorId
    }

    const anchors = Array.from(headingElements).map((el) => {
      const tag = el.tagName
      const content = (el.innerHTML ? el.innerHTML.trim() : '')
      const anchorId = getNextAnchorId()
      el.setAttribute('id', anchorId.toString())
      const scrollToElement = () => {
        // console.log('tag clicked' + tag)
        document.getElementById(anchorId).scrollIntoView({ behavior: 'smooth' }) 
      }
      el.onClick = () => { scrollToElement() }
      return { 'tag': tag, 'content': content, 'anchorId': anchorId, 'action': scrollToElement }
    })

    this.anchors = anchors
    this.introContent = el.innerHTML
    this.resultsContent = resultsContent
  }

  renderAnchors = () => {
    // Translate the flat list of h1, h2, etc tags into hierarchical menu structure
    // that can be converted to a list of CollapsibleMenu components
    // console.log(this.anchors)
    const menus = []
    let items = []
    for (const element of this.anchors) {
      const tag = element['tag'].toLowerCase()
      if (tag == 'h1') {
        items = []
        const currentMenu = { ...element, 'items': items }
        menus.push(currentMenu)
      }
      else {
        items.push(element)
      }
    }

    return (
      menus.map((menu, index) => {
        return <CollapsibleMenu title={menu['content']} key={index}>
                { menu['items'].map((item, index) => {
                  return (
                    <div className={ 'outline-item-'+item['tag'].toLowerCase() } key={index}>
                      <HashLink smooth to={'#'+item['anchorId']}>{item['content']}</HashLink>
                    </div>
                  )
                })}
              </CollapsibleMenu>
      })
    )
  }
}


class ChallengeDetailsPage extends React.Component {

  componentDidMount() {
    const { loadChallenge, challengeId } = this.props
    loadChallenge(parseInt(challengeId))
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
    const { isFetching, user, challenge, error } = this.props

    if (isFetching) {
      return (
        <PublicLayout>
          <div className="text-center">
            <Loader />
          </div>
        </PublicLayout>
      )
    }

    if (error != undefined) {
      return (
        <PublicLayout>
          <NavigationBarPublic showLogoOnNavbar={true} />
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

    const challengeContent = new ChallengeContent(challenge)

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

    const isLoggedIn = user && Object.keys(user).length > 0
    const userCanJoin = isLoggedIn && !challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN
    const userCanSubmitEntry =  isLoggedIn && challenge.isFollowed && challenge.timeStatus == CHALLENGE_TIME_STATUS.CURRENT && challenge.status == CHALLENGE_STATUS.OPEN

    const userCanSeeSubmissions = isLoggedIn
    // Results are visible to:
    //  - site admins who are logged on
    //  - or when results are announced
    //  - or when challenge is archived
    const userCanSeeResults = (isLoggedIn && user.can_create_challenges) || challenge.status == CHALLENGE_STATUS.RESULT_ANNOUNCED || challenge.status == CHALLENGE_STATUS.ARCHIVED

    const tabHashes = userCanSeeSubmissions ? ['#intro', '#submissions', '#my_entries', '#results']
                                            : ['#intro', '#results']

    const tabIndex = tabHashes.includes(window.location.hash) ? tabHashes.indexOf(window.location.hash) : 0
    const onSelectTab = (index) => {
      history.pushState(null, null, tabHashes[index])
      this.setState({ tabIndex: tabIndex })
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
    // console.log("userTimeZone = "+userTimeZone)

    document.title = `${challenge.name} - PrecisionFDA Challenge`

    return (
      <PublicLayout>
        <NavigationBarPublic showLogoOnNavbar={true}>
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
        </NavigationBarPublic>
        
        <div className="challenge-details-main-container">
          <div className="left-column">
            <Tabs defaultIndex={tabIndex} onSelect={onSelectTab}>
              <TabList>
                <Tab>INTRODUCTION</Tab>
                {userCanSeeSubmissions && (
                  <>
                  <Tab>SUBMISSIONS</Tab>
                  <Tab>MY ENTRIES</Tab>
                  </>
                )}
                {userCanSeeResults && (
                <Tab>RESULTS</Tab>
                )}
              </TabList>

              <TabPanel>
                <div className="challenge-details-content" dangerouslySetInnerHTML={{ __html: challengeContent.introContent }}></div>
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
                <div className="challenge-details-content" dangerouslySetInnerHTML={{ __html: challengeContent.resultsContent }}></div>
              </TabPanel>
              )}
            </Tabs>
          </div>
          <div className="right-column pfda-main-content-sidebar">
            <button className={joinChallengeButtonClasses} onClick={() => {if (userCanJoin) { this.handleJoinChallenge()}}}>{joinChallengeButtonTitle}</button>
            {userCanSubmitEntry && (
              <a className="btn btn-primary btn-block" style={{ marginTop: '12px' }} href={challenge.links.new_submission}>Submit Challenge Entry</a>
            )}
            {tabIndex == 0 && (
            <>
              <hr style={{ marginTop: '24px' }} />
              <div className="challenge-details-outline">
                {challengeContent.renderAnchors()}
              </div>
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
  challengeId: PropTypes.string,
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
