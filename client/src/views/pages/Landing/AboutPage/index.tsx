import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { PageContainerMargin } from '../../../../components/Page/styles'
import { useAuthUser } from '../../../../features/auth/useAuthUser'
import { usePageMeta } from '../../../../hooks/usePageMeta'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../../layouts/PublicLayout'
import { ButtonSolidBlue } from '../../../../components/Button/index'
import { colors } from '../../../../styles/theme'

const AboutTab = styled.div<{ isActive?: boolean }>`
  position: relative;
  top: 1px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  color: inherit;
  background-color: #fafafa;
  border: 1px solid #ddd;

  ${({ isActive }) =>
    isActive
      ? css`
          background-color: white;
          border-bottom: 1px solid transparent;
        `
      : css`
          border-bottom: 1px solid #ddd;
          &:hover {
            color: inherit;
          }
        `}
`

const AboutTabRow = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;

  @media (min-width: 1000px) {
    flex-direction: row;
    gap: 8px;
    border-bottom: 1px solid #ddd;
  }
`

const AboutSection = styled.div<{ isShown?: boolean }>`
  display: none;
  margin-bottom: 32px;
  padding: 16px;
  line-height: 24px;

  ${({ isShown }) =>
    isShown &&
    css`
      box-sizing: border-box;
      display: inline-block;
      border: 1px solid #ddd;
      border-top: 0;
      width: 100%;
      padding-top: 32px;
    `}

  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eeeeee;
  }
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1000px) {
    flex-direction: row;
    * > {
      flex: 50%;
    }
  }
`

const AboutGuestInfo = styled.div`
  margin-bottom: 64px;
`
const TabTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
`
const MainLine = styled.div`
  font-size: 20px;
  font-weight: bold;
  line-height: 30px;
  color: ${colors.primaryBlue};
`

type AboutSectionType = 'why' | 'what' | 'who' | 'how'

const AboutPage = () => {
  usePageMeta({ title: 'About - precisionFDA' })
  const user = useAuthUser()
  const isLoggedIn = user?.id

  const [selectedSection, setSelectedSection] =
    useState<AboutSectionType>('why')

  const title = 'About precisionFDA'
  return (
    <PublicLayout>
      <NavigationBar title={title} user={user} />

      <PageContainerMargin>
        <AboutTabRow>
          <AboutTab
            isActive={selectedSection === 'why'}
            onClick={() => setSelectedSection('why')}
          >
            <TabTitle>Why</TabTitle>
            <div>Background and motivation</div>
          </AboutTab>
          <AboutTab
            isActive={selectedSection === 'what'}
            onClick={() => setSelectedSection('what')}
          >
            <TabTitle>What</TabTitle>
            <div>A genomics community and platform</div>
          </AboutTab>
          <AboutTab
            isActive={selectedSection === 'who'}
            onClick={() => setSelectedSection('who')}
          >
            <TabTitle>Who</TabTitle>
            <div>The team behind the initiative</div>
          </AboutTab>
          <AboutTab as={Link} to="/docs">
            <TabTitle>How</TabTitle>
            <div>Learn how to use the features</div>
          </AboutTab>
        </AboutTabRow>

        <AboutSection isShown={selectedSection === 'why'}>
          <MainLine>
            The Food and Drug Administration (FDA) plays an integral role in
            precision medicine, which foresees the day when an individual’s
            medical care will be tailored in part based on their unique
            characteristics and genetic make-up.
          </MainLine>
          <hr />
          <Row>
            <div>
              <p>
                To accelerate progress towards this vision, in July 2014, FDA’s
                Chief Health Informatics Officer (CHIO), Taha Kass-Hout, M.D.,
                began investigating the concept of a research and development
                portal that would allow community members to test, pilot, and
                validate existing and new bioinformatics approaches for
                processing the vast amount of genomic data that is collected
                using Next Generation Sequencing (NGS) technology.
              </p>
              <p>
                After conducting market research, collaborating with FDA’s{' '}
                <a href="http://www.fda.gov<%= about_path %>FDA/CentersOffices/OfficeofMedicalProductsandTobacco/CDRH/">
                  Center for Devices and Radiological Health
                </a>{' '}
                and assembling a project team, the precisionFDA project was
                initiated on July 22, 2015 with a scheduled beta launch date of
                December 15, 2015.
              </p>
            </div>
            <div>
              <p>
                <img
                  src="/assets/beta-release.png"
                  alt="Beta release Timeline: Beta launch on Dec 2015"
                />
              </p>
            </div>
          </Row>
        </AboutSection>

        <AboutSection isShown={selectedSection === 'what'}>
          <MainLine>
            PrecisionFDA provides the genomics community with a secure,
            cloud-based platform where participants can access and share
            datasets, analysis pipelines, and bioinformatics tools, in order to
            benchmark their approaches and advance regulatory science.
          </MainLine>
          <hr />
          <p>
            While precisionFDA does not serve a regulatory role, it is expected
            to generate knowledge to inform future regulatory pathways and
            decision making.
          </p>
          <p>
            PrecisionFDA provides a private area where participants (individuals
            or organizations) can conduct genome analysis and comparison against
            reference material, and a community area where they can publish and
            share results, reference materials, and tools. The precisionFDA
            community continues to grow and includes:
          </p>

          <ul>
            <li>Genome Test or Software Providers</li>
            <li>Standards-making Bodies</li>
            <li>Pharmaceutical &amp; Biotechnology Companies</li>
            <li>Healthcare Providers</li>
            <li>Academic Medical Centers</li>
            <li>Researchers</li>
            <li>Patients</li>
            <li>FDA &amp; Other Government Agencies</li>
          </ul>
        </AboutSection>

        <AboutSection isShown={selectedSection === 'who'}>
          <MainLine>
            PrecisionFDA is an initiative in the Office of Health Informatics
            (OHI) at the Food and Drug Administration led by the Chief Health
            Informatics Officer (CHIO), Dr. Taha Kass-Hout, MD, MS.
          </MainLine>
          <hr />
          <p>
            The core project team consists of the following individuals, in
            alphabetical order:
          </p>
          <ul>
            <li>George Asimenos*</li>
            <li>Ruth Bandler</li>
            <li>Adam Berger</li>
            <li>Elaine Johanson</li>
            <li>Taha Kass-Hout</li>
            <li>Xueying (Sharon) Liang</li>
            <li>David Litwack</li>
            <li>Elizabeth Mansfield</li>
            <li>Omar Serang*</li>
            <li>Sam Westreich*</li>
            <li>Zivana Tezak</li>
          </ul>
          <hr />
          <p>
            The team also wishes to thank the following individuals for their
            significant contributions to the effort:
          </p>
          <ul>
            <li>Vincent Amatrudo</li>
            <li>Angela Anderson*</li>
            <li>Rob Califf</li>
            <li>Mohammed (Sohail) Chaudhry</li>
            <li>Caroline Clode*</li>
            <li>Stephanie Devaney</li>
            <li>Amber Griffin</li>
            <li>Letria Hall</li>
            <li>Walter Harris</li>
            <li>Sally Howard</li>
            <li>Sean Hanlon</li>
            <li>Farhan Khan</li>
            <li>Bruce Kuhlik</li>
            <li>Margaret Leizear</li>
            <li>DJ Patil</li>
            <li>Shawn Porter</li>
            <li>Karen Riley</li>
            <li>Alyson Saben</li>
            <li>Jeff Shuren</li>
            <li>Vahan Simonyan</li>
            <li>Todd Simpson</li>
            <li>Sean Wybenga</li>
          </ul>
          <br />
          <p>*Contractor to FDA’s Office of Health Informatics</p> <hr />
          <div>
            Media asset attributions:
            <ul>
              <li>
                <a href="http://medialoot.com/">MediaLoot</a>
              </li>
            </ul>
          </div>
        </AboutSection>
        {!isLoggedIn && (
          <AboutGuestInfo>
            <div className="container">
              <div className="panel panel-info text-center">
                <div className="panel-body">
                  <p className="lead lead-bold">
                    This program is in production at this time.
                  </p>
                  <p className="lead">
                    For further information and to express interest in
                    participating please submit our request access form.
                  </p>
                </div>
                <div className="panel-body">
                  <ButtonSolidBlue as="a" href="/request_access">
                    <span className="fa fa-user-plus" aria-hidden="true" />{' '}
                    Request Access
                  </ButtonSolidBlue>
                </div>
              </div>
            </div>
          </AboutGuestInfo>
        )}
      </PageContainerMargin>
    </PublicLayout>
  )
}

export default AboutPage
