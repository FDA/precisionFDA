import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { PageContainerMargin } from '../../../components/Page/styles'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { colors } from '../../../styles/theme'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import SocialMediaButtons from '../../../components/NavigationBar/SocialMediaButtons'
import PublicLayout from '../../../layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { expertDetailsRequest } from '../api'
import { ExpertDetails } from '../types'
import { ExpertAbout } from './About'
import { ExpertBlog } from './Blog'
import {
  ExpertData,
  ExpertImage,
  ExpertRow,
  Filler,
  StyledTab,
  StyledTabList,
} from './styles'
import { NavLink } from '../../../components/NavLink'

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

const ExpertContentRow = styled.div`
  flex: 1;
`

const BackToModulePage = styled(Link)`
  color: ${colors.blueOnBlack} !important;
`

const ExpertsSingleDetails = ({ expert }: { expert: ExpertDetails }) => {
  usePageMeta({ title: `${expert?.title} - precisionFDA Experts` })
  const user = useAuthUser()!

  return (
    <PublicLayout mainScroll>
      <NavigationBar title="" subtitle="" user={user}>
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
          <ExpertContentRow>
            <StyledTabList>
              <StyledTab
                as={NavLink}
                to={`/experts/${expert?.id}/about`}
                activeClassName="selected"
              >
                About This Expert
              </StyledTab>
              <StyledTab
                as={NavLink}
                to={`/experts/${expert?.id}/blog`}
                activeClassName="selected"
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

            <Routes>
              <Route path="about" element={<ExpertAbout expert={expert} />} />
              <Route path="blog" element={<ExpertBlog user={user} expert={expert} />} />
              <Route path="/" element={<Navigate to="about" replace />} />
            </Routes>
          </ExpertContentRow>
        </ExpertRow>
      </PageContainerMargin>
    </PublicLayout>
  )
}

const ExpertsSingleDetailsPage = () => {
  const { expertId } = useParams<{ expertId: string }>()
  const { isLoading, data } = useQuery({
    queryKey: ['queryExpertDetails'],
    queryFn: () => expertDetailsRequest(expertId)
  })
  if (isLoading) return <Loader />
  if(!data?.expert) return <div>No expert found</div>
  return <ExpertsSingleDetails expert={data.expert} />
}

export default ExpertsSingleDetailsPage
