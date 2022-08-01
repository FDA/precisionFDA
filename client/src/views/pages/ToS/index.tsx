import React from 'react'
import styled from 'styled-components'
import { PageContainer } from '../../../components/Page/styles'
import NavigationBar, {
  NavigationBarBanner,
  NavigationBarPublicLandingTitle,
} from '../../components/NavigationBar/NavigationBar'
import { PFDALogoLight } from '../../components/NavigationBar/PFDALogo'
import SocialMediaButtons from '../../components/NavigationBar/SocialMediaButtons'
import PublicLayout from '../../layouts/PublicLayout'
import { Tagline } from '../Landing/Tagline'

const StyledTos = styled.div`
  line-height: 22px;
  padding-top: 32px;
  padding-bottom: 32px;
  padding-left: 32px;
  padding-right: 32px;
`

export const ToS = () => (
  <PublicLayout>
    <NavigationBar>
      <NavigationBarBanner>
        <NavigationBarPublicLandingTitle>
          <PFDALogoLight />
          <Tagline />
        </NavigationBarPublicLandingTitle>
        <SocialMediaButtons showText={false} />
      </NavigationBarBanner>
    </NavigationBar>
    <PageContainer>
      <StyledTos>
        <h1>Terms of Service</h1>
        <p>Last modified: May 16, 2022</p>
        <hr />
        <p>WE'RE IN PRODUCTION!</p>
        <p>
          PrecisionFDA is a production research project and not for clinical
          use. We may limit or otherwise restrict your access to the services in
          line with our Terms of Service.
        </p>
        <hr />

        <p>
          The U.S. Food and Drug Administration (“FDA”) offers some of its
          services through PrecisionFDA [located at https://precision.fda.gov]
          as part of the FDA’s work in building a strong community contributing
          to a standards-based approach for ensuring the accuracy of genetic
          tests incorporating next generation sequencing (NGS) technologies. Use
          of the services made available via PrecisionFDA is restricted to usage
          specifically related to the FDA’s PrecisionFDA program as determined
          by the FDA. The services are offered subject to your acceptance of the
          terms and conditions contained herein as well as any relevant sections
          of the FDA Website Policies.
        </p>

        <p>
          These Terms of Service, which include the definitions for acceptable
          use of PrecisionFDA services, are an agreement between the User and
          the FDA and govern all access to, and use of, the services we provide
          through the website at https://precision.fda.gov (the "Site"). A
          “User” is a PrecisionFDA User or other entity to whom the User has
          granted permission to access the Services. “User Data” means the data,
          software and other information shared by a User to or through the
          services or derived from the data, software and other information
          shared.
        </p>

        <p>
          The services provided at the Site are subject to these terms. Use of
          PrecisionFDA constitutes acceptance to this Agreement.
        </p>

        <p>
          1. Services. <br />
          1.1. License. Subject to User’s compliance with this Agreement and
          applicable laws and regulations, FDA hereby grants User a
          nonexclusive, nontransferable, revocable, limited license during the
          term of this Agreement to access and use and to authorize Users to
          access and use the Services to transfer, store, process, analyze and
          display User Data in performing PrecisionFDA-related tasks. The
          “Services” means the PrecisionFDA website, application programming
          interface (API), software development kit (SDK), analysis software
          developed by FDA or third parties and provided as FDA publicly shared
          data, upload agent, command line tools and other software, data,
          documentation, systems and services licensed and provided by FDA for
          data management and analysis in the performance of
          PrecisionFDA-related tasks. User shall be solely liable for any use of
          the Services. <br />
          1.2. Restrictions. User shall use the Services solely in accordance
          with this Agreement and applicable laws and regulations. User shall
          not, and shall not cause or permit any other party to:
          <br />
          1.2.1. except with respect to software which is distributed under a
          free open-source license, copy, translate, modify, adapt, enhance,
          decompile, disassemble or reverse engineer the Services or otherwise
          determine or attempt to determine source code or protocols from the
          executable code of the Services or create any derivative works based
          upon the Services;
          <br />
          1.2.2. except with respect to software which is distributed under a
          free open-source license, reproduce or extract ideas, algorithms,
          procedures, workflows or hierarchies from the Services or otherwise
          use the Services for the purpose of creating a similar product or
          service;
          <br />
          1.2.3. provide unauthorized access to or use of the Services;
          <br />
          1.2.4. sell, rent, transfer or otherwise make available the Services
          to third parties in violation of this Agreement;
          <br />
          1.2.5. use the Services to reproduce, modify, distribute, perform,
          display, access or use User Data in violation of any applicable laws
          or agreements with the owners of User Data;
          <br />
          1.2.6. introduce any virus, malware, or spyware into the Services;
          <br />
          1.2.7. adversely impact the speed, security or integrity of the
          Services;
          <br />
          1.2.8. adversely impact the cost of delivering the Services;
          <br />
          1.2.9. circumvent or render ineffective measures implemented to
          protect and control the Services and User Data;
          <br />
          1.2.10. conduct any sort of penetration testing or exploit any
          vulnerabilities in the Services; or
          <br />
          1.2.11. use any Free and Open Source Software (“FOSS”) in a way that
          would cause the non-FOSS portions of the Services to be subject to any
          FOSS licensing terms or obligations. Free and Open Source Software
          means any software that is subject to terms that, as a condition of
          use, copying modification or redistribution, require such software or
          derivatives thereof to be disclosed and/or distributed in source code
          form, to be licensed for purposes of making derivative works, or to be
          redistributed free of charge, including without limitation software
          distributed under the GNU General Public License or GNU Lesser/Library
          GPL.
          <br />
        </p>
        <p>
          2. User Data.
          <br />
          2.1. Warranty. User represents, warrants and covenants that the
          acquisition and provision of User Data to PrecisionFDA for use in
          accordance with this Agreement (a) do not violate the rights of or
          breach any duty or obligation to any User or third party and (b) are
          done in compliance with applicable law, which includes providing all
          necessary notices to, and obtaining all necessary permissions and
          informed consents from, human subjects from whom samples were taken
          and the owners of nonhuman samples that User has obtained.
          <br />
          2.2. User Responsibilities. User shall be solely responsible for (a)
          the use and operation of software that User or Users install or that
          are installed on User’s or Users’ behalf, (b) User’s or Users’ sharing
          of User Data with any third party and (c) the backup of User Data.
          <br />
          2.3. Protected Health Information. Users shall not store Protected
          Health Information (PHI) on PrecisionFDA unless all necessary
          permissions and informed consents have been obtained.
          <br />
          2.4. Personally Identifiable Information. Users shall not store
          Personally Identifiable Information (PII)on PrecisionFDA unless all
          necessary permissions and informed consents have been obtained. <br />
          2.5. Confidential Commercial Information. Users shall not store
          Confidential Commercial Information on PrecisionFDA in a manner which
          renders the information accessible to all Users and the FDA.
          <br />
          2.6. Trade Secrets. PrecisionFDA Users shall not store Trade Secrets
          on PrecisionFDA.
          <br />
        </p>
        <p>
          3. Privacy and Security. FDA shall not access information contained
          solely in a private space. FDA shall maintain administrative, physical
          and technical safeguards for protection of the security,
          confidentiality and integrity of User Data that are consistent with
          industry standards for services similar to the Services. FDA may
          monitor User’s use of the API and Apps for quality assurance,
          management and improvement of the Services and verification of
          compliance with this Agreement.
          <br />
        </p>
        <p>
          4. Accessing and Using the Services. When creating any login account
          to access and use the Services, User shall provide complete, accurate
          and up-to-date information, including, for example, email addresses
          used to provide notices to User under this Agreement and shall update
          or correct such information as needed. User shall promptly notify FDA
          of any unauthorized access or use of the Services.
          <br />
        </p>
        <p>
          5. Intellectual Property. Except as expressly stated or as required by
          laws of the United States of America, this Agreement does not grant
          either party any rights, implied or otherwise, to the other’s
          intellectual property.
          <br />
          5.1. User IP. As between the parties, User has and shall retain all
          right, title and interest, including Intellectual Property Rights, in
          and to User Data (“User IP”). “Intellectual Property Rights” means all
          current and future worldwide rights under the laws of patents,
          copyrights, trade secrets, trademarks, moral rights and other
          intellectual property. User hereby grants FDA a nonexclusive,
          nontransferable, revocable, royalty- free, limited license during the
          term of this Agreement to access and use User IP solely for the
          purpose of delivering Services.
          <br />
        </p>
        <p>
          6. Compliance.
          <br />
          6.1. Applicable Law. User agrees to comply with all local and state
          laws and regulations and the laws of the United States of America,
          including without limitation those pertaining to personal data
          security and privacy and export and re-export restrictions and
          regulations of the Department of Commerce and any other United States
          or foreign agencies and authorities in connection with User’s use of
          the Services. In particular, but without limitation, User shall not
          export or re-export the Services in violation of any laws into any US
          embargoed country or to anyone on the US Treasury Department’s list of
          Specially Designated Nationals or the US Commerce Department’s Table
          of Deny Orders.
          <br />
          6.2. Other Agreements. User represents, warrants and promises that
          execution of this Agreement and the exercise and performance of any
          rights and obligations under this Agreement do not conflict with or
          breach an agreements with any third party.
          <br />
        </p>
        <p>
          7. Availability; Backups.
          <br />
          7.1. Availability; Backups. FDA makes no representations or warranties
          regarding the durability or availability of third party cloud
          services, such as Amazon Web Services, that FDA uses to provide the
          Services. FDA will have no obligation to back up User Data or any
          other software, data or information provided by User or Users.
          <br />
        </p>
        <p>
          8. Term and Termination.
          <br />
          8.1. Term. The term of this Agreement begins on the date of acceptance
          of these Terms of Service or date of the first use of Services,
          whichever is earlier. The term of this agreement ends upon Termination
          for Any Reason, Termination for Breach, or Termination of Services,
          whichever occurs first.
          <br />
          8.2. Termination for Any Reason. Either party may terminate this
          Agreement at any time provided at least 30 days’ prior written notice
          of termination is provided to the other party.
          <br />
          8.3. Termination for Breach. Either party may terminate this Agreement
          for material breach upon 15 days’ notice if the material breach
          remains uncured at the end of the notice period.
          <br />
          8.4. Termination of Services. Services are currently delivered under
          an FDA research grant which terminates on April 30th, 2016, at which
          time FDA may terminate Services without prior notice.
          <br />
          8.5. Effect. Upon termination of this Agreement, all applicable
          licenses and other rights granted to Customer will immediately
          terminate, and FDA will have no obligation to store or provide access
          to any User Data, which may be deleted without liability.
          <br />
        </p>
      </StyledTos>
    </PageContainer>
  </PublicLayout>
)
