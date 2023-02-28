import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { theme } from '../../../styles/theme'
import ExternalLink from '../Controls/ExternalLink'

import fdaLogo from '../../../assets/logo-fda-2016.png'
import { TwitterIcon } from '../../../components/icons/TwitterIcon'
import { EnvelopeIcon } from '../../../components/icons/EnvelopeIcon'
import { LinkedInIcon } from '../../../components/icons/LinkedInIcon'

const StyledFooterContainer = styled.div`
  background-color: ${theme.colors.subtleBlue};
  border-top: 1px solid ${theme.colors.borderDefault};
`

const StyledFooterWrapper = styled.div`
  max-width: ${theme.sizing.mainContainerMaxWidth};
  margin: 0 auto;
`

const StyledFooter = styled.footer`
  display: grid;
  grid-template-columns: 1fr;
  padding: 32px 32px;
  font-size: 14px;
  line-height: 1.428571429;
  ul {
    display: flex;
    list-style: none;
    padding-left: 0;
    margin-left: -5px;
    margin-top: 0;
    flex-wrap: wrap;
    margin-bottom: 0;
  }
  li {
    display: flex;
    align-items: center;
    padding-left: 5px;
    padding-right: 5px;
    white-space: nowrap;
    margin-bottom: 10px;
  }
  p {
    margin: 0 0 10px;
    color: #555555;
  }

  @media (min-width: 770px) {
    grid-template-columns: 288px 1fr;
  }
`

const SocialLink = styled.li`
  height: 20px;
  display: flex;
  align-items: flex-end;
  a {
    height: 14px;
  }
`

const StyledFooterAddress = styled.div`
  padding-right: 32px;
`

const StyledFDALogo = styled.a`
  display: block;
  margin-bottom: 10px;
`


const PFDAFooter = () => (
    <StyledFooterContainer>
      <StyledFooterWrapper>
        <StyledFooter role="contentinfo">
          <div>
            <StyledFDALogo href="http://www.fda.gov" title="FDA Home Page">
              <img src={fdaLogo} alt="FDA Home Page" width="41px" height="46px"/>
            </StyledFDALogo>
          </div>
          <div>
            <ul>
              <li><Link to="/" title="precisionFDA Home Page">precisionFDA</Link></li>
              <li aria-hidden="true">|</li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/docs">Docs</Link></li>
              <li><Link to="/terms" title="precisionFDA Terms of Service">Terms of Service</Link></li>
              <li><a data-turbolinks="false" href="/guidelines">Guidelines</a></li>
              <li><a data-turbolinks="false" href="/presskit">Press Kit</a></li>
              <li aria-hidden="true">|</li>
              <SocialLink><a href="mailto:precisionfda@fda.hhs.gov"><EnvelopeIcon /></a></SocialLink>
              <SocialLink><ExternalLink to="https://twitter.com/precisionfda"><TwitterIcon /></ExternalLink></SocialLink>
              <SocialLink><ExternalLink to="https://www.linkedin.com/company/fda" ><LinkedInIcon /></ExternalLink></SocialLink>
            </ul>
            <ul>
              <li><a href="http://www.fda.gov/" target="_blank" title="FDA Home Page" aria-label='Navigate to the FDA home page in another window' rel="noreferrer">FDA</a></li>
              <li aria-hidden="true">|</li>
              <li><a href="http://www.fda.gov/AboutFDA/AboutThisWebsite/Accessibility/default.htm" target="_blank" title="Accessibility" rel="noreferrer">Accessibility</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/Transparency/Basics/default.htm" target="_blank" title="FDA Basics" rel="noreferrer">Basics</a></li>
              <li><a href="http://www.fda.gov/RegulatoryInformation/FOI/default.htm" target="_blank" title="Freedom of Information Act" rel="noreferrer">FOIA</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/WorkingatFDA/NoFearAct/default.htm" target="_blank" title="No Fear Act" rel="noreferrer">No Fear Act</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/Transparency/default.htm" target="_blank" title="Transparency" rel="noreferrer">Transparency</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/AboutThisWebsite/WebsitePolicies/default.htm" target="_blank" title="Website Policies" rel="noreferrer">Website Policies</a></li>
              <li><a href="https://www.hhs.gov/vulnerability-disclosure-policy/index.html" target="_blank" title="Vulnerability Disclosure Policy" rel="noreferrer">Vulnerability Disclosure Policy</a></li>
            </ul>
          </div>
          <StyledFooterAddress>
            <address>
              <strong>U.S. Food and Drug Administration</strong><br/>
              10903 New Hampshire Avenue<br/>
              Silver Spring, MD 20993<br/>
              <span aria-hidden="true" /> 1-888-INFO-FDA (1-888-463-6332)<br/>
              <span aria-hidden="true" /> <a href="http://www.fda.gov/AboutFDA/ContactFDA/default.htm" title="Contact FDA">Contact FDA</a>
            </address>
          </StyledFooterAddress>
          <div>
            <p>Some links on this website may direct you to non-FDA locations.</p>
            <p>FDA does not endorse or guarantee the integrity of information on these external sites.</p>
          </div>
        </StyledFooter>
      </StyledFooterWrapper>
    </StyledFooterContainer>
  )

export default PFDAFooter
