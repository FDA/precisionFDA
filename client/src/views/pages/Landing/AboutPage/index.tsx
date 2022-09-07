import React from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'

import { useAuthUser } from '../../../../features/auth/useAuthUser'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../../layouts/PublicLayout'


const AboutPage = () => {
  const user = useAuthUser()
  const isLoggedIn = (user !== null)
  const title = 'About precisionFDA'
  return (
    <PublicLayout>
      <NavigationBar title={title} user={user} />

        <Tabs>
        <div className="container-fluid">
          <TabList className="nav nav-tabs nav-tabs-padded nav-tabs-lg nav-justified">
            <Tab selectedClassName="active">
              <a>
                <span className="tab-label">Why?</span>
                <span className="tab-help">Background and motivation</span>
              </a>
            </Tab>
            <Tab selectedClassName="active">
              <a>
                <span className="tab-label">What?</span>
                <span className="tab-help">A genomics community and platform</span>
              </a>
            </Tab>
            <Tab selectedClassName="active">
              <a>
                <span className="tab-label">Who?</span>
                <span className="tab-help">The team behind the initiative</span>
              </a>
            </Tab>
            <Tab selectedClassName="active">
              <a href="/docs">
                <span className="tab-label">How?</span>
                <span className="tab-help">Learn how to use the features</span>
              </a>
            </Tab>
          </TabList>
          </div>

          <div className="container">
          <TabPanel>
            <div role="tabpanel" className="tab-pane tab-pane-padded tab-pane-padded-xl active" id="why">
              <div className="row">
                <div className="lead lead-intro text-primary">
                  The Food and Drug Administration (FDA) plays an integral role in precision medicine, which foresees the day when an individual’s medical care will be tailored in part based on their unique characteristics and genetic make-up.
                </div>
                <hr/>
                <div className="col-md-12">
                  <p className="lead">To accelerate progress towards this vision, in July 2014, FDA’s Chief Health Informatics Officer (CHIO), Taha Kass-Hout, M.D., began investigating the concept of a research and development portal that would allow community members to test, pilot, and validate existing and new bioinformatics approaches for processing the vast amount of genomic data that is collected using Next Generation Sequencing (NGS) technology.
                  </p>
                  <p className="lead">
                    After conducting market research, collaborating with FDA’s <a href="http://www.fda.gov<%= about_path %>FDA/CentersOffices/OfficeofMedicalProductsandTobacco/CDRH/">Center for Devices and Radiological Health</a> and assembling a project team, the precisionFDA project was initiated on July 22, 2015 with a scheduled beta launch date of December 15, 2015.
                  </p>
                </div>
                <div className="col-md-11 col-md-offset-1">
                  <p className="text-center">
                    <img src="/assets/beta-release.png" className="img-responsive img-thumbnail" alt="Beta release Timeline: Beta launch on Dec 2015" />
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div role="tabpanel" className="tab-pane tab-pane-padded tab-pane-padded-xl active" id="what">
              <div className="lead lead-intro text-primary">
                PrecisionFDA provides the genomics community with a secure, cloud-based platform where participants can access and share datasets, analysis pipelines, and bioinformatics tools, in order to benchmark their approaches and advance regulatory science.
              </div>
              <hr/>
              <p className="lead">
                While precisionFDA does not serve a regulatory role, it is expected to generate knowledge to inform future regulatory pathways and decision making.
              </p>
              <p className="lead">
                PrecisionFDA provides a private area where participants (individuals or organizations) can conduct genome analysis and comparison against reference material, and a community area where they can publish and share results, reference materials, and tools. The precisionFDA community continues to grow and includes:
              </p>

              <ul className="lead lead-regular">
                <li>Genome Test or Software Providers</li>
                <li>Standards-making Bodies</li>
                <li>Pharmaceutical &amp; Biotechnology Companies</li>
                <li>Healthcare Providers</li>
                <li>Academic Medical Centers</li>
                <li>Researchers</li>
                <li>Patients</li>
                <li>FDA &amp; Other Government Agencies</li>
              </ul>
            </div>
          </TabPanel>
          <TabPanel>
            <div role="tabpanel" className="tab-pane tab-pane-padded tab-pane-padded-xl active" id="who">
              <div className="lead lead-intro text-primary">
                PrecisionFDA is an initiative in the Office of Health Informatics (OHI) at the Food and Drug Administration led by the Chief Health Informatics Officer (CHIO), Dr. Taha Kass-Hout, MD, MS.
              </div>
              <hr/>
              <p className="lead">
                The core project team consists of the following individuals, in alphabetical order:
              </p>

              <ul className="list list-inline list-bricks lead lead-bold">
                <li>George Asimenos*</li>
                <li>Ruth Bandler</li>
                <li>Adam Berger</li>
                <li>Pamella Tater*</li>
                <li>Elaine Johanson</li>
                <li>Taha Kass-Hout</li>
                <li>Xueying (Sharon) Liang</li>
                <li>David Litwack</li>
                <li>Elizabeth Mansfield</li>
                <li>Omar Serang*</li>
                <li>Sam Westreich*</li>
                <li>Zivana Tezak</li>
              </ul>

              <hr/>

              <p className="lead">
                The team also wishes to thank the following individuals for their significant contributions to the effort:
              </p>

              <ul className="list list-inline list-bricks lead lead-regular">
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

              <br/>
              <p className="text-muted">*Contractor to FDA’s Office of Health Informatics</p>      <hr />
              <div>
                Media asset attributions:
                <ul className="text-muted">
                  <li>
                    <a href="http://medialoot.com/">MediaLoot</a>
                  </li>
                </ul>
              </div>
            </div>
          </TabPanel>
          <TabPanel />
          </div>
        </Tabs>

      {!isLoggedIn && (
        <>
          <hr/>
          <div className="container">
            <div className="panel panel-info text-center">
              <div className="panel-body">
                <p className="lead lead-bold">This program is in production at this time.</p>
                <p className="lead">For further information and to express interest in participating please submit our request access form.</p>
              </div>
              <div className="panel-body">
                <a className="btn accessible-btn-success btn-lg" href="/request_access"><span className="fa fa-user-plus" aria-hidden="true" /> Request Access</a>
              </div>
            </div>
          </div>
        </>
      )}
    </PublicLayout>
  )
}

export default AboutPage
