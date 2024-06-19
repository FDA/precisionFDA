import React from 'react'
import styled from 'styled-components'
import { UserLayout } from '../../layouts/UserLayout'
import { PageContainerMargin } from '../../components/Page/styles'

const Text = styled.div`
  text-align: center;
  margin-top: 64px;
`

const NoFoundPage = () =>
  <UserLayout mainScroll>
    <PageContainerMargin><Text>Page not found</Text></PageContainerMargin>
  </UserLayout>

export default NoFoundPage
