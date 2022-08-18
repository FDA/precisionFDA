import React, { useLayoutEffect, useState } from 'react'
import { Remarkable } from 'remarkable'
import { linkify } from 'remarkable/linkify'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from 'react-query'
// @ts-ignore
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import styled from 'styled-components'
import httpStatusCodes from 'http-status-codes'

import PublicLayout from '../../../layouts/PublicLayout'
import { askQuestion, fetchExpertDetails } from '../../../../api/experts'
import { ExpertDetails } from '../../../components/Experts/ExpertDetails'
import { ExpertBlog } from '../../../components/Experts/ExpertBlog'
import { IExpert } from '../../../../types/expert'
import Loader from '../../../components/Loader'
import { StyledPageContainer, StyledPageLeftColumn, StyledPageRightColumn, StyledTabsExpertPage } from './styles'
import { EXPERT_STATE } from '../../../../constants'
import './style.sass'
import { SocialMediaButtons } from '../../../components/NavigationBar/SocialMediaButtons'
import navBackground from '../../../../assets/NavbarBackground.png'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { hideExpertsAskQuestionModal, showExpertsAskQuestionModal } from '../../../../actions/experts'
import { ExpertAskQuestionModal } from '../../../components/Experts/ExpertAskQuestionModal'
import Button from '../../../components/Button'
import { expertsSelector } from '../../../../reducers/experts/details/selectors'
import history from '../../../../utils/history'
import UserContent from '../../../components/UserContent'
import { colors } from '../../../../styles/theme'


const StyledNavigationBar = styled.div`
  width: 100%;
  background-color: rgb(22, 19, 14);
  background-image: url(${navBackground});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: white;
  height: 155px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`
const StyledSocialMediaButtons = styled.div`
  margin-top: 100px;
  margin-right: 2%
`

const BackToModulePage = styled(Link)`
  color: ${colors.blueOnBlack} !important
`

const ExpertsSingleDetailsPage = () => {
  const { expertId, page } = useParams<{ expertId: string; page: string }>()
  const [expert, setExpert] = useState<IExpert>()
  const { isLoading, data } = useQuery<any>('queryExpertDetails', () =>
    fetchExpertDetails(expertId),
  )
  useLayoutEffect(() => {
    if (data) {
      setExpert(data)
    }
  }, [data])

  const dispatch = useDispatch()
  const hideModalAction = () => dispatch(hideExpertsAskQuestionModal())
  const showModalAction = () => dispatch(showExpertsAskQuestionModal())

  const user =  useSelector(contextUserSelector)
  const askQuestionModal = useSelector(
    state => expertsSelector(state).details.askQuestionModal,
  )
  const [tabIndex, setTabIndex] = useState(-1)
  const queryClient = useQueryClient()

  const askExpert = (userName: string, question: string, captchaValue: string) => {
    createQuestionMutation
      .mutateAsync({ userName, question, captchaValue })
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          queryClient.invalidateQueries('queryExpertDetails')
          toast.success('Your question was submitted successfully')
          hideModalAction()
          history.push(`/experts/${expertId}`)
        } else {
          const errorMessage = response.payload?.error?.message
          toast.error(errorMessage || 'Your question was not submitted')
        }
      })
  }
  const createQuestionMutation = useMutation(
    ({ userName, question, captchaValue }: { userName: string; question: string, captchaValue: string }) =>
      askQuestion({ userName, question, captchaValue }, expertId),
  )

  if (isLoading) {
    return (
      <div className="text-center">
        <Loader />
      </div>
    )
  }
  const expertIsOpened = expert && expert.state === EXPERT_STATE.OPEN
  const userExpert = expert && expert.user_id === user.id
  const editPermitted = userExpert || user.can_administer_site
  const isLoggedIn = user && user.id && Object.keys(user).length > 0

  const createUserContent = () => {
    const md = new Remarkable('full', { typographer: true }).use(linkify)

    return new UserContent(md.render(expert?.blog), isLoggedIn)
  }

  const displayContent = () => {
    const userContent = createUserContent()

    return userContent.createDisplayElement()
  }

  const outlineContent = () => {
    const userContent = createUserContent()

    return userContent.createOutlineElement()
  }
  const content = displayContent()

  const tabs = [
    {
      title: 'About this expert',
      subroute: '',
      content: <ExpertDetails expert={expert} />,
      outline: '',
    },
    {
      title: 'Blog Post',
      subroute: '/blog',
      content: <ExpertBlog expert={expert} content={content} />,
      outline: outlineContent(),
    },
    {
      title: 'Q&A',
      subroute: '/qa',
      content: '',
      outline: '',
    },
  ]

  const tabSubroutes = tabs.map(x => x['subroute'])

  if (tabIndex < 0) {
    const pageRoute = `/${page}`
    setTabIndex(
      tabSubroutes.includes(pageRoute) ? tabSubroutes.indexOf(pageRoute) : 0,
    )
  }

  const onSelectTab = (index: any) => {
    setTabIndex(index)
    const url = `/experts/${expert?.id}${tabSubroutes[index]}`
    if (tabSubroutes[index] === '/qa') {
      // @ts-ignore
      window.open(url).focus()
    } else {
      history.push(url)
    }
  }

  const title = ''
  const subtitle = ''
  const showSocialMediaButtonText = false
  const showLogoOnNavbar = true
  const expertFaceData = (
    <StyledNavigationBar>
      <div className="experts-details__left-column__logo-bar">
        <img
            className="experts-details__expert-image"
            src={expert?.image}
            alt="Expert's Logo"
        />
        <div className="experts-details__logo-data">
          <BackToModulePage to={{ pathname: '/experts' }}>
            &larr; Back to All Experts
          </BackToModulePage>

          <h1>{expert?.title}</h1>
        </div>
      </div>
      <StyledSocialMediaButtons>
        <SocialMediaButtons showText={showSocialMediaButtonText} />
      </StyledSocialMediaButtons>
    </StyledNavigationBar>
  )

  return (
    <PublicLayout>
      <NavigationBar
        title={title}
        subtitle={subtitle}
        showLogoOnNavbar={showLogoOnNavbar}
        user={user}
      >
        {expertFaceData}
      </NavigationBar>
      <StyledPageContainer>
        <StyledPageLeftColumn>
          <StyledTabsExpertPage>
            <Tabs defaultIndex={tabIndex} onSelect={onSelectTab}>
              <TabList className="expert-details-tabs__tab-list">
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    className="expert-details-tabs__tab"
                    selectedClassName="expert-details-tabs__tab--selected"
                  >
                    {tab.title}
                  </Tab>
                ))}
              </TabList>

              {tabs.map((tab, index) => (
                <TabPanel key={index}>{tab.content}</TabPanel>
              ))}
            </Tabs>
          </StyledTabsExpertPage>
        </StyledPageLeftColumn>
        {tabSubroutes[tabIndex] === '' && (
          <StyledPageRightColumn>
            <div className="experts-page-layout right-column">
              {expertIsOpened && (
                <div
                  className="btn-group"
                  style={{ marginTop: '24px', width: '100%' }}
                >
                  <Button
                    size="md"
                    className="btn btn-default btn-block"
                    onClick={showModalAction}
                  >
                    Ask this expert
                  </Button>
                </div>
              )}
              {editPermitted && (
                <div
                  className="btn-group"
                  style={{ marginTop: '24px', width: '100%' }}
                >
                  <a
                    className="btn btn-default btn-block"
                    href={`/experts/${expert?.id}/edit`}
                  >
                    Edit Expert Info
                  </a>
                </div>
              )}
            </div>
          </StyledPageRightColumn>
        )}
        {tabSubroutes[tabIndex] === '/blog' && (
          <StyledPageRightColumn>
            <div className="experts-page-layout right-column">
              {tabs[tabIndex].outline}
            </div>
          </StyledPageRightColumn>
        )}
      </StyledPageContainer>
      <ExpertAskQuestionModal
        isOpen={askQuestionModal.isOpen}
        isLoading={askQuestionModal.isLoading}
        user={user}
        expert={expert}
        hideAction={hideModalAction}
        action={askExpert}
        isLoggedIn={isLoggedIn}
      />
    </PublicLayout>
  )
}

export const ExpertsSinglePage = ExpertsSingleDetailsPage
