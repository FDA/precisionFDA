import httpStatusCodes from 'http-status-codes'
import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, NavLink, Route, Switch, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Remarkable } from 'remarkable'
import { linkify } from 'remarkable/linkify'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button/index'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import { EXPERT_STATE } from '../../../constants'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { colors } from '../../../styles/theme'
import history from '../../../utils/history'
import NavigationBar from '../../../views/components/NavigationBar/NavigationBar'
import SocialMediaButtons from '../../../views/components/NavigationBar/SocialMediaButtons'
import UserContent from '../../../views/components/UserContent'
import PublicLayout from '../../../views/layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { useModal } from '../../modal/useModal'
import { askQuestion, expertDetailsRequest } from '../api'
import { ExpertDetails } from '../types'
import { ExpertAbout } from './About'
import { ExpertBlog } from './Blog'
import { ExpertAskQuestionModal } from './ExpertAskQuestionModal'
import {
  ExpertData,
  ExpertImage,
  ExpertRow,
  Filler,
  StyledPageRightColumn,
  StyledTab,
  StyledTabList,
} from './styles'

const StyledNavigationBar = styled.div`
  width: 100%;
  color: white;
  height: 140px;
  display: flex;
  flex-direction: row;
`
const StyledSocialMediaButtons = styled.div`
  margin-top: 100px;
  justify-self: flex-end;
`

const MainExpertContent = styled.div`
  max-width: 710px;
`

const ActionRow = styled.div`
  margin-top: 64px;
  display: flex;
  gap: 8px;
`

const BackToModulePage = styled(Link)`
  color: ${colors.blueOnBlack} !important;
`

const ExpertsSingleDetails = ({ expert }: { expert: ExpertDetails }) => {
  usePageMeta({ title: `${expert?.title} - precisionFDA Experts` })
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const modal = useModal()

  const createQuestionMutation = useMutation({
    mutationKey: ['create-question'],
    mutationFn: ({
      userName,
      question,
      captchaValue,
    }: {
      userName: string
      question: string
      captchaValue: string
    }) =>
      askQuestion({ userName, question, captchaValue }, expert.id.toString()),
  })
  const askExpert = (
    userName: string,
    question: string,
    captchaValue: string,
  ) => {
    createQuestionMutation
      .mutateAsync({ userName, question, captchaValue })
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          queryClient.invalidateQueries(['queryExpertDetails'])
          toast.success('Your question was submitted successfully')
          modal.setShowModal(false)
          history.push(`/experts/${expert.id}`)
        } else {
          const errorMessage = response.payload?.error?.message
          toast.error(errorMessage || 'Your question was not submitted')
        }
      })
  }

  const expertIsOpened = expert && expert.state === EXPERT_STATE.OPEN
  const userExpert = expert && expert.user_id === user?.id
  const editPermitted = userExpert || user?.can_administer_site
  const isLoggedIn = (user?.id && Object.keys(user).length > 0) || false

  const createUserContent = () => {
    const md = new Remarkable('full', { typographer: true }).use(linkify)

    return new UserContent(md.render(expert?.blog), isLoggedIn)
  }

  const displayContent = () => {
    const userContent = createUserContent()

    return userContent.createDisplayElement()
  }

  const content = displayContent()

  return (
    <PublicLayout>
      <NavigationBar
        title=""
        subtitle=""
        user={user}
      >
          <PageContainerMargin>
        <StyledNavigationBar>
            <ExpertRow>
              <ExpertImage src={expert?.image} alt="Expert's Logo" />
              <ExpertData>
                <BackToModulePage
                  to={{ pathname: '/experts' }}
                  data-turbolinks="false"
                >
                  &larr; Back to All Experts
                </BackToModulePage>

                <h1>{expert?.title}</h1>
              </ExpertData>
            </ExpertRow>
            <StyledSocialMediaButtons>
              <SocialMediaButtons />
            </StyledSocialMediaButtons>
        </StyledNavigationBar>
          </PageContainerMargin>
      </NavigationBar>
      <PageContainerMargin>
        <ExpertRow>
          <Filler />
          <MainExpertContent>
            <StyledTabList>
              <StyledTab
                as={NavLink}
                to={`/experts/${expert?.id}`}
                data-turbolinks="false"
                activeClassName="selected"
                exact
              >
                About This Expert
              </StyledTab>
              <StyledTab
                as={NavLink}
                to={`/experts/${expert?.id}/blog`}
                activeClassName="selected"
                data-turbolinks="false"
              >
                Blog Post
              </StyledTab>
              <StyledTab
                as="a"
                data-turbolinks="false"
                href={`/experts/${expert?.id}/qa`}
                target="_blank"
                rel="noreferrer"
              >
                Q&A
              </StyledTab>
            </StyledTabList>

            <Switch>
              <Route exact path={`/experts/${expert?.id}/blog`}>
                <ExpertBlog expert={expert} content={content} />
              </Route>
              <Route path={`/experts/${expert?.id}`}>
                <ExpertAbout expert={expert} />
              </Route>
            </Switch>

            <StyledPageRightColumn>
              <ActionRow>
                {expertIsOpened && (
                  <div>
                    <ButtonSolidBlue onClick={() => modal.setShowModal(true)}>
                      Ask this expert
                    </ButtonSolidBlue>
                  </div>
                )}
                {editPermitted && (
                  <div>
                    <ButtonSolidBlue
                      as="a"
                      data-turbolinks="false"
                      href={`/experts/${expert?.id}/edit`}
                    >
                      Edit Expert Info
                    </ButtonSolidBlue>
                  </div>
                )}
              </ActionRow>
            </StyledPageRightColumn>
          </MainExpertContent>
        </ExpertRow>
      </PageContainerMargin>
      <ExpertAskQuestionModal
        isOpen={modal.isShown}
        isLoading={!expert}
        user={user}
        expert={expert}
        hideAction={() => modal.setShowModal(false)}
        action={askExpert}
        isLoggedIn={isLoggedIn}
        title="Submit a new question"
      />
    </PublicLayout>
  )
}

const ExpertsSingleDetailsPage = () => {
  const { expertId } = useParams<{ expertId: string }>()
  const { isLoading, data } = useQuery(['queryExpertDetails'], () =>
    expertDetailsRequest(expertId),
  )
  if (isLoading) return <Loader />
  return <ExpertsSingleDetails expert={data!.expert} />
}

export default ExpertsSingleDetailsPage
