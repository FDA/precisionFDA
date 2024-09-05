import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { PageContainerMargin } from '../../components/Page/styles'
import { useAuthUser } from '../../features/auth/useAuthUser'
import { usePageMeta } from '../../hooks/usePageMeta'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../layouts/PublicLayout'
import { colors } from '../../styles/theme'
import { PfTab, PfTabContent, PfTabRow, PfTabTitle } from '../../components/Tabs/PfTab'
import { Button } from '../../components/Button'


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
    <PublicLayout mainScroll>
      <NavigationBar title={title} user={user} />

      <PageContainerMargin>
        <PfTabRow>
          <PfTab
            $isActive={selectedSection === 'why'}
            onClick={() => setSelectedSection('why')}
          >
            <PfTabTitle>Why</PfTabTitle>
            <div>Background and motivation</div>
          </PfTab>
          <PfTab
            $isActive={selectedSection === 'what'}
            onClick={() => setSelectedSection('what')}
          >
            <PfTabTitle>What</PfTabTitle>
            <div>A genomics community and platform</div>
          </PfTab>
          <PfTab
            $isActive={selectedSection === 'who'}
            onClick={() => setSelectedSection('who')}
          >
            <PfTabTitle>Who</PfTabTitle>
            <div>The team behind the initiative</div>
          </PfTab>
          <PfTab as={Link} to="/docs">
            <PfTabTitle>How</PfTabTitle>
            <div>Learn how to use the features</div>
          </PfTab>
        </PfTabRow>

        <PfTabContent $isShown={selectedSection === 'why'}>
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
        </PfTabContent>

        <PfTabContent $isShown={selectedSection === 'what'}>
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
        </PfTabContent>

        <PfTabContent $isShown={selectedSection === 'who'}>
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
        </PfTabContent>
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
                  <Button data-variant="primary" as="a" href="/request_access">
                    <span className="fa fa-user-plus" aria-hidden="true" />{' '}
                    Request Access
                  </Button>
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
