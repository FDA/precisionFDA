import { useState } from 'react'
import { Button } from '../../components/Button'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import { PageContainerMargin } from '../../components/Page/styles'
import { PfTab, PfTabContent, PfTabRow, PfTabTitle } from '../../components/Tabs/PfTab'
import { useAuthUser } from '../../features/auth/useAuthUser'
import { usePageMeta } from '../../hooks/usePageMeta'
import PublicLayout from '../../layouts/PublicLayout'
import { RichText } from '../styles'

//TODO JIRI: TO BE DELETED COMPLETELY

type AboutSectionType = 'why' | 'what' | 'who' | 'how'

const AboutPage = () => {
  usePageMeta({ title: 'About - precisionFDA' })
  const user = useAuthUser()
  const isLoggedIn = user?.id

  const [selectedSection, setSelectedSection] = useState<AboutSectionType>('why')

  const title = 'About precisionFDA'
  return (
    <PublicLayout mainScroll={!!user}>
      <NavigationBar title={title} user={user} />

      <PageContainerMargin>
        <PfTabRow>
          <PfTab $isActive={selectedSection === 'why'} onClick={() => setSelectedSection('why')}>
            <PfTabTitle>Why</PfTabTitle>
            <div>Background and motivation</div>
          </PfTab>
          <PfTab $isActive={selectedSection === 'what'} onClick={() => setSelectedSection('what')}>
            <PfTabTitle>What</PfTabTitle>
            <div>A genomics community and platform</div>
          </PfTab>
          <PfTab $isActive={selectedSection === 'who'} onClick={() => setSelectedSection('who')}>
            <PfTabTitle>Who</PfTabTitle>
            <div>The team behind the initiative</div>
          </PfTab>
          <PfTab as="a" href="/docs" target="_blank">
            <PfTabTitle>How</PfTabTitle>
            <div>Learn how to use the features</div>
          </PfTab>
        </PfTabRow>

        <PfTabContent $isShown={selectedSection === 'why'}>
          <div className="text-xl font-bold leading-[30px] text-primary-blue">
            The Food and Drug Administration (FDA) plays an integral role in precision medicine, which foresees the day when an
            individual&apos;s medical care will be tailored in part based on their unique characteristics and genetic make-up.
          </div>
          <hr />
          <div className="flex flex-col gap-4 lg:flex-row lg:*:flex-1">
            <RichText>
              <p>
                To accelerate progress towards this vision, in July 2014, FDA’s Chief Health Informatics Officer (CHIO), Taha
                Kass-Hout, M.D., began investigating the concept of a research and development portal that would allow community
                members to test, pilot, and validate existing and new bioinformatics approaches for processing the vast amount of
                genomic data that is collected using Next Generation Sequencing (NGS) technology.
              </p>
              <p>
                After conducting market research, collaborating with FDA’s{' '}
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://www.fda.gov/about-fda/fda-organization/center-devices-and-radiological-health"
                >
                  Center for Devices and Radiological Health
                </a>{' '}
                and assembling a project team, the precisionFDA project was initiated on July 22, 2015 with a scheduled beta
                launch date of December 15, 2015.
              </p>
            </RichText>
            <div>
              <p>
                <img src="/assets/beta-release.png" alt="Beta release Timeline: Beta launch on Dec 2015" />
              </p>
            </div>
          </div>
        </PfTabContent>

        <PfTabContent $isShown={selectedSection === 'what'}>
          <div className="text-xl font-bold leading-[30px] text-primary-blue">
            PrecisionFDA provides the genomics community with a secure, cloud-based platform where participants can access and
            share datasets, analysis pipelines, and bioinformatics tools, in order to benchmark their approaches and advance
            regulatory science.
          </div>
          <hr />
          <RichText>
            <p>
              While precisionFDA does not serve a regulatory role, it is expected to generate knowledge to inform future
              regulatory pathways and decision making.
            </p>
            <p>
              PrecisionFDA provides a private area where participants (individuals or organizations) can conduct genome analysis
              and comparison against reference material, and a community area where they can publish and share results, reference
              materials, and tools. The precisionFDA community continues to grow and includes:
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
          </RichText>
        </PfTabContent>

        <PfTabContent $isShown={selectedSection === 'who'}>
          <div className="text-xl font-bold leading-[30px] text-primary-blue">
            PrecisionFDA is an initiative in the Office of Health Informatics (OHI) at the Food and Drug Administration led by the
            Chief Health Informatics Officer (CHIO), Dr. Taha Kass-Hout, MD, MS.
          </div>
          <hr />
          <RichText>
            <p>The core project team consists of the following individuals, in alphabetical order:</p>
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
            <p>The team also wishes to thank the following individuals for their significant contributions to the effort:</p>
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
          </RichText>
        </PfTabContent>
        {!isLoggedIn && (
          <div className="mb-16">
            <div className="container">
              <div className="flex flex-col items-center border border-(--c-layout-border) bg-(--tertiary-70) p-8 text-center [&_p]:mb-4">
                <div>
                  <p className="text-xl font-bold">This program is in production at this time.</p>
                  <p>
                    For further information and to express interest in participating please submit our request access form.
                  </p>
                </div>
                <div>
                  <Button data-variant="primary" as="a" href="/request_access">
                    <span className="fa fa-user-plus" aria-hidden="true" /> Request Access
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainerMargin>
    </PublicLayout>
  )
}

export default AboutPage
