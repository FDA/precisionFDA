import React from 'react'
import { Link } from 'react-router'
import fdaLogo from '../../assets/logo-fda.svg'
import { EnvelopeIcon } from '../icons/EnvelopeIcon'
import { ThemeToggle } from '../ThemeToggle'

const footerListClassName = 'mt-0 mb-0 -ml-[5px] flex list-none flex-wrap pl-0'
const footerListItemClassName = 'mb-[10px] flex items-center whitespace-nowrap px-[5px]'
const footerTextClassName = 'mb-[10px]'

const PFDAFooter = () => {
  return (
    <div className="border-line bg-surface-subtle border-t">
      <div className="mx-auto max-w-[1330px]">
        <footer
          role="contentinfo"
          className="grid gap-4 p-8 text-sm leading-[1.428571429] min-[1030px]:grid-cols-[auto_2fr_0.5fr]"
        >
          <div>
            <a href="http://www.fda.gov" title="FDA Home Page" className="mb-[10px] block">
              <img src={fdaLogo} alt="FDA Home Page" width="41px" height="46px" />
            </a>
            <div className="pr-8">
              <address>
                <strong>U.S. Food and Drug Administration</strong>
                <br />
                10903 New Hampshire Avenue
                <br />
                Silver Spring, MD 20993
                <br />
                <span aria-hidden="true" /> 1-888-INFO-FDA (1-888-463-6332)
                <br />
                <span aria-hidden="true" />{' '}
                <a href="http://www.fda.gov/AboutFDA/ContactFDA/default.htm" title="Contact FDA">
                  Contact FDA
                </a>
              </address>
            </div>
          </div>
          <div className="flex justify-start">
            <div>
              <ul className={footerListClassName}>
                <li className={footerListItemClassName}>
                  <Link to="/" title="precisionFDA Home Page">
                    precisionFDA
                  </Link>
                </li>
                <li className={footerListItemClassName} aria-hidden="true">
                  |
                </li>
                <li className={footerListItemClassName}>
                  <a href="/docs" target="_blank">
                    Docs
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <Link to="/terms" title="precisionFDA Terms of Service">
                    Terms of Service
                  </Link>
                </li>
                <li className={footerListItemClassName}>
                  <Link to="/security" title="precisionFDA Security">
                    Security Statement
                  </Link>
                </li>
                <li className={footerListItemClassName}>
                  <a data-turbolinks="false" href="/guidelines">
                    Guidelines
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <a data-turbolinks="false" href="/presskit">
                    Press Kit
                  </a>
                </li>
                <li className={footerListItemClassName} aria-hidden="true">
                  |
                </li>
                <li className="mb-2 flex items-center px-[5px]">
                  <a href="mailto:precisionfda@fda.hhs.gov">
                    <EnvelopeIcon />
                  </a>
                </li>
              </ul>
              <ul className={footerListClassName}>
                <li className={footerListItemClassName}>
                  <a
                    href="http://www.fda.gov/"
                    target="_blank"
                    title="FDA Home Page"
                    aria-label="Navigate to the FDA home page in another window"
                    rel="noreferrer"
                  >
                    FDA
                  </a>
                </li>
                <li className={footerListItemClassName} aria-hidden="true">
                  |
                </li>
                <li className={footerListItemClassName}>
                  <a
                    href="http://www.fda.gov/AboutFDA/AboutThisWebsite/Accessibility/default.htm"
                    target="_blank"
                    title="Accessibility"
                    rel="noreferrer"
                  >
                    Accessibility
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <a
                    href="http://www.fda.gov/AboutFDA/Transparency/Basics/default.htm"
                    target="_blank"
                    title="FDA Basics"
                    rel="noreferrer"
                  >
                    Basics
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <a
                    href="http://www.fda.gov/RegulatoryInformation/FOI/default.htm"
                    target="_blank"
                    title="Freedom of Information Act"
                    rel="noreferrer"
                  >
                    FOIA
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <a
                    href="http://www.fda.gov/AboutFDA/WorkingatFDA/NoFearAct/default.htm"
                    target="_blank"
                    title="No Fear Act"
                    rel="noreferrer"
                  >
                    No Fear Act
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <a
                    href="http://www.fda.gov/AboutFDA/Transparency/default.htm"
                    target="_blank"
                    title="Transparency"
                    rel="noreferrer"
                  >
                    Transparency
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <a
                    href="http://www.fda.gov/AboutFDA/AboutThisWebsite/WebsitePolicies/default.htm"
                    target="_blank"
                    title="Website Policies"
                    rel="noreferrer"
                  >
                    Website Policies
                  </a>
                </li>
                <li className={footerListItemClassName}>
                  <a
                    href="https://www.hhs.gov/vulnerability-disclosure-policy/index.html"
                    target="_blank"
                    title="Vulnerability Disclosure Policy"
                    rel="noreferrer"
                  >
                    Vulnerability Disclosure Policy
                  </a>
                </li>
              </ul>
              <div>
                <p className={footerTextClassName}>Some links on this website may direct you to non-FDA locations.</p>
                <p className={footerTextClassName}>
                  FDA does not endorse or guarantee the integrity of information on these external sites.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-start min-[1030px]:items-start min-[1030px]:justify-end">
            <ThemeToggle className="self-start" />
          </div>
        </footer>
      </div>
    </div>
  )
}

export default PFDAFooter
