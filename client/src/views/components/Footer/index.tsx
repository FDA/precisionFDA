import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { theme } from '../../../styles/theme'
import ExternalLink from '../Controls/ExternalLink'

import fdaLogo from '../../../assets/logo-fda-2016.png'

const StyledFooterContainer = styled.div`
  width: 100%;
  background-color: ${theme.colors.subtleBlue};
  border-top: 1px solid ${theme.colors.borderDefault};
`

const StyledFooterWrapper = styled.div`
  max-width: ${theme.sizing.mainContainerMaxWidth};
  margin: 0 auto;
`

const StyledFooter = styled.footer`
  display: grid;
  grid-template-columns: ${theme.sizing.largeColumnWidth} 1fr;
  padding: ${theme.padding.mainContentVertical} ${theme.padding.mainContentHorizontal};
  font-size: 14px;
  line-height: 1.428571429;
  ul {
    list-style: none;
    padding-left: 0;
    margin-left: -5px;
    margin-top: 0;
  }
  li {
    display: inline-block;
    padding-left: 5px;
    padding-right: 5px;
  }
  p {
    margin: 0 0 10px;
    color: #555555;
  }
`

const StyledFooterAddress = styled.div`
  padding-right: ${theme.padding.mainContentHorizontal};
`

const StyledFDALogo = styled.a`
  display: block;
  margin-bottom: 10px;
`


const PFDAFooter = () => {
  return (
    <StyledFooterContainer>
      <StyledFooterWrapper>
        <StyledFooter role="contentInfo">
          <div>
            <StyledFDALogo href="http://www.fda.gov" title="FDA Home Page">
              <img src={fdaLogo} alt="FDA Home Page" width="41px" height="46px"/>
            </StyledFDALogo>
          </div>
          <div>
            <ul className="list-inline">
              <li><Link to="/" title="precisionFDA Home Page">precisionFDA</Link></li>
              <li className="text-muted"  aria-hidden="true">|</li>
              <li><Link to="/about">About</Link></li>
              <li><a href="/docs">Docs</a></li>
              <li><Link to="/terms" title="precisionFDA Terms of Service">Terms of Service</Link></li>
              <li><a href="/guidelines">Guidelines</a></li>
              <li><a href="/presskit">Press Kit</a></li>
              <li className="text-muted" aria-hidden="true">|</li>
              <li><a href="mailto:precisionfda@fda.hhs.gov"><span className="fa fa-envelope" aria-hidden="true"></span> Email the team</a></li>
              <li><ExternalLink to="https://twitter.com/precisionfda"><span className="fa fa-twitter" aria-hidden="true"></span> Twitter</ExternalLink></li>
              <li><ExternalLink to="https://www.linkedin.com/showcase/precisionfda" className="fa fa-linkedin"> LinkedIn</ExternalLink></li>
            </ul>
            <ul className="list-inline">
              <li><a href="http://www.fda.gov/" target="_blank" title="FDA Home Page" aria-label='Navigate to the FDA home page in another window'>FDA</a></li>
              <li className="text-muted" aria-hidden="true">|</li>
              <li><a href="http://www.fda.gov/AboutFDA/AboutThisWebsite/Accessibility/default.htm" target="_blank" title="Accessibility">Accessibility</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/Transparency/Basics/default.htm" target="_blank" title="FDA Basics">Basics</a></li>
              <li><a href="http://www.fda.gov/RegulatoryInformation/FOI/default.htm" target="_blank" title="Freedom of Information Act">FOIA</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/WorkingatFDA/NoFearAct/default.htm" target="_blank" title="No Fear Act">No Fear Act</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/Transparency/default.htm" target="_blank" title="Transparency">Transparency</a></li>
              <li><a href="http://www.fda.gov/AboutFDA/AboutThisWebsite/WebsitePolicies/default.htm" target="_blank" title="Website Policies">Website Policies</a></li>
              <li><a href="https://www.hhs.gov/vulnerability-disclosure-policy/index.html" target="_blank" title="Vulnerability Disclosure Policy">Vulnerability Disclosure Policy</a></li>
            </ul>
          </div>
          <StyledFooterAddress>
            <address>
              <strong>U.S. Food and Drug Administration</strong><br/>
              10903 New Hampshire Avenue<br/>
              Silver Spring, MD 20993<br/>
              <span className="icon-phone" aria-hidden="true"></span> 1-888-INFO-FDA (1-888-463-6332)<br/>
              <span className="icon-envelope-alt" aria-hidden="true"></span> <a href="http://www.fda.gov/AboutFDA/ContactFDA/default.htm" title="Contact FDA">Contact FDA</a>
            </address>
          </StyledFooterAddress>
          <div className="site-footer-main disclaimer accessible-text-muted">
            <p>Some links on this website may direct you to non-FDA locations.</p>
            <p>FDA does not endorse or guarantee the integrity of information on these external sites.</p>
          </div>
        </StyledFooter>
      </StyledFooterWrapper>
    </StyledFooterContainer>
  )
}

export default PFDAFooter
