import React from 'react'
import { PageContainerMargin } from '../../components/Page/styles'
import { OverviewCenterSection, PageRow } from '../../components/Public/styles'
import { usePageMeta } from '../../hooks/usePageMeta'
import NavigationBar, { NavigationBarBanner, NavigationBarPublicLandingTitle } from '../../components/NavigationBar/NavigationBar'
import MailButton from '../../components/NavigationBar/SocialMediaButtons'
import PublicLayout from '../../layouts/PublicLayout'
import { PageOverviewMainBody } from './styles'
import { Button } from '../../components/Button'
import styled from 'styled-components'

const HeroContent = styled.div`
  text-align: center;
`

const HeroTitle = styled.h1`
  font-size: clamp(2.55rem, 5.1vw, 4.25rem);
  font-weight: 900;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 50%, var(--primary-800) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
`

const HeroSubtitle = styled.p`
  font-size: clamp(1.02rem, 2.125vw, 1.19rem);
  color: var(--tertiary-700);
  margin-bottom: 3rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`

const SignUpButton = styled(Button)`
  display: block;
  margin: 0 auto;
  padding: 20px 40px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const ContentSection = styled.section`
  margin-bottom: 50px;
`

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FullWidthCard = styled.div`
  grid-column: 1 / -1;
  background: var(--background);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--tertiary-100);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--c-link);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 30px;
  }
`

const FeatureCard = styled.div`
  background: var(--background);
  border-radius: 20px;
  padding: 35px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--tertiary-100);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--c-link);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 30px;
  }
`

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--tertiary-900);
`

const FeatureDescription = styled.p`
  color: var(--tertiary-700);
  line-height: 1.7;
  margin-bottom: 10px;
`

const FeatureLink = styled.a`
  color: var(--primary-600);
  text-decoration: none;
  font-weight: 600;
`

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`

const GetStartedSection = styled.div`
  padding-top: 25px;
  border-top: 2px solid var(--tertiary-200);
`

const GetStartedTitle = styled.h4`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--tertiary-900);
  margin-bottom: 20px;
  text-align: center;
`

const MiniStepCard = styled.div`
  background: var(--background);
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.2s ease;
  flex: 1;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--tertiary-100);
`

const MiniStepIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-600) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.2rem;
  color: var(--tertiary-100);
  font-weight: 900;
`

const MiniStepTitle = styled.h5`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--tertiary-900);
  margin-bottom: 12px;
`

const MiniStepDescription = styled.p`
  color: var(--tertiary-700);
  font-size: 0.9rem;
  line-height: 1.6;
`

const MiniArrow = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    font-size: 2rem;
    color: var(--primary-500);
    align-self: center;
    margin: 0 15px;
    font-weight: 700;
  }
`

const SectionTitle = styled.h2`
  font-size: clamp(2.125rem, 4.25vw, 2.975rem);
  font-weight: 800;
  text-align: center;
  margin-bottom: 20px;
  color: var(--tertiary-900);
`

const SectionSubtitle = styled.p`
  text-align: center;
  color: var(--tertiary-700);
  font-size: 1.2rem;
  max-width: 750px;
  margin: 0 auto;
`

const CTASection = styled.div`
  text-align: center;
  border-radius: 20px;
`

const CTATitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
`

const CTASubtitle = styled.p`
  font-size: 1.1rem;
  margin-bottom: 30px;
`

const StyledInfoRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 25px;

  ${Button} {
    border-radius: 5px;
    padding: 10px 16px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  a {
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    color: var(--primary-600);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: 1px solid var(--primary-600);
  }
`

export const OverviewPublic = () => {
  usePageMeta({ title: 'precisionFDA - Overview' })
  return (
    <PublicLayout mainScroll={false}>
      <NavigationBar user={null}>
        <PageContainerMargin>
          <NavigationBarBanner>
            <NavigationBarPublicLandingTitle />
            <MailButton />
          </NavigationBarBanner>
        </PageContainerMargin>
      </NavigationBar>
      <PageRow>
        <PageContainerMargin>
          <PageOverviewMainBody>
            <PrecisionFDALanding />
          </PageOverviewMainBody>
          <OverviewCenterSection>
            <StyledInfoRow>
              <Button data-variant="primary" as="a" href="/docs" target="_blank">
                Learn more
              </Button>
              <a href="mailto:precisionfda@fda.hhs.gov">Feedback</a>
            </StyledInfoRow>
          </OverviewCenterSection>
        </PageContainerMargin>
      </PageRow>
    </PublicLayout>
  )
}

const PrecisionFDALanding = () => {
  return (
    <PageContainerMargin>
      <HeroContent>
        <HeroTitle>precisionFDA</HeroTitle>
        <HeroSubtitle>
          A secure, collaborative, cloud-based high-performance computing environment advancing regulatory science and AI
          innovation for the FDA
        </HeroSubtitle>
      </HeroContent>

      <ContentSection>
        <SectionTitle>Everything You Need to Know</SectionTitle>
        <SectionSubtitle>
          Discover how precisionFDA facilitates collaboration and accelerates scientific discovery
        </SectionSubtitle>

        <SectionGrid>
          <FeatureCard>
            <FeatureTitle>What is precisionFDA?</FeatureTitle>
            <FeatureDescription>
              precisionFDA is a secure, collaborative, cloud-based high-performance computing environment that was launched by the
              U.S. Food and Drug Administration (FDA) to facilitate the collection, analysis, and application of data and new
              tools to support its mission.
            </FeatureDescription>
            <FeatureDescription>
              The platform offers collaborative opportunities, capabilities, and initiatives to help inform regulatory science,
              speed the Agency's understanding of evolving science, and advance the ethical and responsible use of artificial
              intelligence (AI) to support the work of FDA regulators and scientists.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureTitle>Who can become a user?</FeatureTitle>
            <FeatureDescription>
              FDA researchers and people who interface with FDA; for example, scientists in industry, academia, and government who
              may collaborate with the Agency through Research Collaboration Agreements (RCAs), Memoranda Of Understanding (MOUs),
              pilot programs, or partnerships.
            </FeatureDescription>
            <FeatureDescription>
              Join our community of scientists participating in exciting <FeatureLink href="/challenges">Challenges</FeatureLink>{' '}
              and collaborative research initiatives.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureTitle>Why become a user?</FeatureTitle>
            <FeatureDescription>
              precisionFDA offers a number of capabilities that facilitate collaborations between FDA researchers and those in the
              external scientific community. They include collaborative spaces in the cloud where participants can safely exchange
              large data sets, including sensitive or confidential data allowed under FEDRamp and FISMA moderate certification.
            </FeatureDescription>
            <FeatureDescription>
              Access secure computational resources specifically configured to meet the most demanding technical computing
              requirements, software tools, and computational pipelines.
            </FeatureDescription>
          </FeatureCard>

          <FullWidthCard>
            <FeatureTitle>How do I become a user?</FeatureTitle>
            <FeatureDescription>
              The best place to start is to <FeatureLink href="/request_access">request access</FeatureLink> in the upper
              right-hand corner of this page. Fill in the form and follow the instructions.
            </FeatureDescription>
            <FeatureDescription>
              Your request will be reviewed and you will receive an email with further instructions to get you started on your
              precisionFDA journey.
            </FeatureDescription>

            <GetStartedSection>
              <GetStartedTitle>Get Started in 3 Simple Steps</GetStartedTitle>
              <StepsContainer>
                <MiniStepCard>
                  <MiniStepIcon>1</MiniStepIcon>
                  <MiniStepTitle>Request Access</MiniStepTitle>
                  <MiniStepDescription>
                    Click the &#34;Request Access&#34; button and fill out the application form
                  </MiniStepDescription>
                </MiniStepCard>

                <MiniArrow>→</MiniArrow>

                <MiniStepCard>
                  <MiniStepIcon>2</MiniStepIcon>
                  <MiniStepTitle>Review Process</MiniStepTitle>
                  <MiniStepDescription>Your application will be reviewed promptly by our team</MiniStepDescription>
                </MiniStepCard>

                <MiniArrow>→</MiniArrow>

                <MiniStepCard>
                  <MiniStepIcon>3</MiniStepIcon>
                  <MiniStepTitle>Start Collaborating</MiniStepTitle>
                  <MiniStepDescription>Receive access email and begin your research projects</MiniStepDescription>
                </MiniStepCard>
              </StepsContainer>
            </GetStartedSection>
          </FullWidthCard>
        </SectionGrid>
      </ContentSection>

      <CTASection>
        <CTATitle>Ready to Transform Your Research?</CTATitle>
        <CTASubtitle>Join the precisionFDA and accelerate your scientific discoveries</CTASubtitle>
        <SignUpButton data-variant={'primary'} as={'a'} href={'/request_access'}>
          Request Access Now
        </SignUpButton>
      </CTASection>
    </PageContainerMargin>
  )
}
